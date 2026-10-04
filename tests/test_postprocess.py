from scripts.google_translator import (
    GeminiTranslator,
    dedupe_annotations,
    postprocess,
    strip_list_markers,
    strip_noise,
)


def test_second_annotation_is_removed():
    text = '테일러 스위프트`Taylor Swift`의 신보에서 테일러 스위프트`Taylor Swift`는'
    assert dedupe_annotations(text) == '테일러 스위프트`Taylor Swift`의 신보에서 테일러 스위프트는'


def test_annotation_with_description_wins():
    text = '폴리리듬`Polyrhythm`과 폴리리듬`Polyrhythm; 둘 이상의 리듬`'
    assert dedupe_annotations(text) == '폴리리듬`Polyrhythm; 둘 이상의 리듬`과 폴리리듬'


def test_different_annotations_are_kept():
    text = '비요크`Björk`와 로살리아`Rosalía`'
    assert dedupe_annotations(text) == text


def test_head_timestamp_is_removed():
    text = '2026년 9월 3일 오후 2:00 (동부 표준시)\n\n본문 첫 문단'
    assert strip_noise(text) == '본문 첫 문단'


def test_tail_newsletter_is_removed():
    text = '본문 첫 문단\n\n마지막 문단\n\n뉴스레터를 구독하세요'
    assert strip_noise(text) == '본문 첫 문단\n\n마지막 문단'


def test_noise_words_in_the_middle_are_kept():
    body = ['첫 문단', '구독자 수가 늘었다는 이야기', '셋째', '넷째', '다섯째', '여섯째']
    text = '\n\n'.join(body)
    assert strip_noise(text) == text


def test_dangling_header_at_the_end_is_removed():
    text = '본문\n\n이번 주 주목할 만한 다른 앨범들:'
    assert strip_noise(text) == '본문'


def test_list_markers_are_removed_but_h3_is_kept():
    text = '### 소제목\n* 첫째\n- 둘째'
    assert strip_list_markers(text) == '### 소제목\n첫째\n둘째'


def test_postprocess_applies_all_rules():
    text = '사진: 제공\n\n* 비요크`Björk`가 돌아왔다. 비요크`Björk`는\n\n더 보기'
    assert postprocess(text) == '비요크`Björk`가 돌아왔다. 비요크는'


def translator_returning(*outputs):
    translator = GeminiTranslator.__new__(GeminiTranslator)
    replies = iter(outputs)
    translator._translate_chunk = lambda chunk: next(replies)
    return translator


def test_content_translation_is_postprocessed():
    translator = translator_returning('비요크`Björk`와 비요크`Björk`\n\n뉴스레터를 구독하세요')
    assert translator._translate_content('short body') == '비요크`Björk`와 비요크'


def test_split_translation_dedupes_across_chunks():
    translator = translator_returning('비요크`Björk`의 첫 장', '비요크`Björk`의 둘째 장')
    long_body = 'a' * 30000 + '\n\n' + 'b' * 30000
    assert translator._translate_content(long_body) == '비요크`Björk`의 첫 장\n\n비요크의 둘째 장'
