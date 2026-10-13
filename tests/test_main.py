from scripts.main import run_all


class Recorder:
    def __init__(self, calls, error=None):
        self.calls = calls
        self.error = error

    def run(self, **kwargs):
        self.calls.append((self, kwargs))
        if self.error:
            raise self.error


class First(Recorder):
    pass


class Second(Recorder):
    pass


class Melon(Recorder):
    pass


def test_failed_scraper_does_not_stop_the_rest():
    calls = []
    first, second, melon = First(calls, RuntimeError('boom')), Second(calls), Melon(calls)
    assert run_all([first, second], melon) == ['First']
    assert [scraper for scraper, _ in calls] == [first, second, melon]


def test_every_failure_is_reported():
    calls = []
    first, melon = First(calls, RuntimeError('boom')), Melon(calls, ValueError('bad'))
    assert run_all([first], melon) == ['First', 'Melon']


def test_column_scrapers_get_limit_and_melon_does_not():
    calls = []
    first, melon = First(calls), Melon(calls)
    assert run_all([first], melon) == []
    assert [kwargs for _, kwargs in calls] == [{'limit': 5}, {}]
