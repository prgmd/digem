import pytest
import requests

from scripts.google_translator import (
    HUMAN,
    MAX_ERROR_LEN,
    RETRY,
    SPLIT,
    WAIT,
    GeminiTranslator,
    TranslationError,
    _failure,
    error_type,
    is_retryable,
    next_action,
    parse_response,
    request_error,
)


def ok_payload(text='번역문', finish='STOP'):
    return {'candidates': [{'finishReason': finish, 'content': {'parts': [{'text': text}]}}]}


def raised(status_code, payload, detail=''):
    with pytest.raises(TranslationError) as info:
        parse_response(status_code, payload, detail)
    return str(info.value)


def test_success_returns_joined_text():
    payload = {'candidates': [{'finishReason': 'STOP', 'content': {'parts': [{'text': '앞'}, {'text': '뒤'}]}}]}
    assert parse_response(200, payload) == '앞뒤'


def test_missing_finish_reason_is_treated_as_stop():
    payload = {'candidates': [{'content': {'parts': [{'text': '본문'}]}}]}
    assert parse_response(200, payload) == '본문'


@pytest.mark.parametrize('status_code', [400, 401, 429, 500, 503])
def test_non_200_becomes_http_type(status_code):
    assert raised(status_code, None, 'detail').startswith(f'http_{status_code}: detail')


def test_unparsable_body_is_bad_response():
    assert raised(200, None).startswith('bad_response:')


def test_blocked_prompt():
    assert raised(200, {'promptFeedback': {'blockReason': 'SAFETY'}}) == 'prompt_blocked: SAFETY'


def test_no_candidates_is_empty_response():
    assert raised(200, {'candidates': []}).startswith('empty_response:')


def test_candidate_without_parts_is_no_content():
    payload = {'candidates': [{'finishReason': 'SAFETY', 'content': {}}]}
    assert raised(200, payload) == 'no_content: finishReason=SAFETY'


def test_max_tokens_is_truncated_not_success():
    assert raised(200, ok_payload('반쪽', 'MAX_TOKENS')).startswith('truncated:')


def test_other_finish_reason_is_incomplete():
    assert raised(200, ok_payload('일부', 'RECITATION')).startswith('incomplete: finishReason=RECITATION')


def test_timeout_exception():
    assert str(request_error(requests.Timeout())).startswith('timeout:')


def test_connection_error_is_network_and_hides_key():
    message = str(request_error(requests.ConnectionError('failed url ?key=AIzaSECRET123')))
    assert message.startswith('network:')
    assert 'SECRET123' not in message


@pytest.mark.parametrize(
    'reason, expected',
    [
        ('content: http_429: RESOURCE_EXHAUSTED', 'http_429'),
        ('title: truncated: 출력 한도 초과', 'truncated'),
        ('timeout: 300초 내 응답 없음', 'timeout'),
        ("content: KeyError: 'parts'", 'unknown'),
        (None, 'unknown'),
        ('', 'unknown'),
    ],
)
def test_error_type_reads_stored_reason(reason, expected):
    assert error_type(reason) == expected


@pytest.mark.parametrize(
    'reason, action',
    [
        ('content: timeout: x', RETRY),
        ('content: network: x', RETRY),
        ('content: bad_response: x', RETRY),
        ('content: empty_response: x', RETRY),
        ('content: http_500: x', RETRY),
        ('content: http_503: x', RETRY),
        ('content: http_429: x', WAIT),
        ('content: truncated: x', SPLIT),
        ('content: prompt_blocked: x', HUMAN),
        ('content: no_content: x', HUMAN),
        ('content: incomplete: x', HUMAN),
        ('content: http_400: x', HUMAN),
        ('content: http_403: x', HUMAN),
        (None, HUMAN),
    ],
)
def test_next_action_by_type(reason, action):
    assert next_action(reason) == action


def test_is_retryable_only_for_retry_and_wait():
    assert is_retryable('content: http_503: x')
    assert is_retryable('content: http_429: x')
    assert not is_retryable('content: truncated: x')
    assert not is_retryable('content: prompt_blocked: x')


def test_failure_record_keeps_stage_and_type():
    record = _failure('content', TranslationError('http_429: quota'))
    assert record['status'] == 'failed'
    assert record['content_ko'] is None
    assert error_type(record['error']) == 'http_429'


def test_failure_record_is_length_limited_and_redacted():
    record = _failure('title', ValueError('key=AIza' + 'x' * 1000))
    assert len(record['error']) <= MAX_ERROR_LEN
    assert 'xxxx' not in record['error']


class FakeResponse:
    def __init__(self, status_code, payload):
        self.status_code = status_code
        self._payload = payload
        self.text = ''
        self.reason = 'reason'

    def json(self):
        if self._payload is None:
            raise ValueError('no json')
        return self._payload


class FakeSession:
    def __init__(self, response=None, error=None):
        self.response = response
        self.error = error

    def post(self, *args, **kwargs):
        if self.error:
            raise self.error
        return self.response


def translator_with(session):
    translator = GeminiTranslator.__new__(GeminiTranslator)
    translator.api_key = 'test-key'
    translator.session = session
    return translator


def test_generate_without_network_returns_text():
    translator = translator_with(FakeSession(FakeResponse(200, ok_payload('완성'))))
    assert translator._generate('prompt') == '완성'


def test_generate_maps_rate_limit():
    body = {'error': {'status': 'RESOURCE_EXHAUSTED', 'message': 'quota'}}
    translator = translator_with(FakeSession(FakeResponse(429, body)))
    with pytest.raises(TranslationError) as info:
        translator._generate('prompt')
    assert next_action(str(info.value)) == WAIT


def test_translate_article_stores_failure_instead_of_raising():
    translator = translator_with(FakeSession(error=requests.Timeout()))
    result = translator.translate_article('title', 'body')
    assert result['status'] == 'failed'
    assert error_type(result['error']) == 'timeout'
    assert is_retryable(result['error'])
