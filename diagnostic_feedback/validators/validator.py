

class Validator(object):

    @classmethod
    def is_empty(cls, value):
        return not value.strip()

    @classmethod
    def invalid_url(cls, value):
        return value.strip() and not value.strip().startswith('http')

    @classmethod
    def empty_list(cls, lst):
        return not bool(lst)

    @classmethod
    def drange(cls, start, stop, step):
        items = []
        r = start
        while r <= stop:
            items.append(r)
            r += step
            r = float("%.1f" % r)

        return items
