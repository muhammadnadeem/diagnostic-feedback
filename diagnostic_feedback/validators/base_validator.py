

class BaseValidator(object):
    """
    Generic method' for validation
    """
    xblock = None
    _ = None

    def __init__(self, xblock):
        self.xblock = xblock
        self._ = xblock._

    def is_empty(self, value):
        """
        check for empty string
        :param value: string to test
        :return: Boolean
        """
        return not value.strip()

    def invalid_url(self, url):
        """
        check for valid url
        :param value: url to test
        :return: Boolean
        """
        return url.strip() and not url.strip().startswith('http')

    def empty_list(self, lst):
        """
        check if a list is empty
        :param lst: list to test
        :return:Boolean
        """
        return not bool(lst)

    def drange(self, start, stop, step):
        """
        generate array of decimals with provided step value
        :param start: range start
        :param stop: range end
        :param step: step value to increment
        :return:
        """
        items = []
        r = start
        while r <= stop:
            items.append(r)
            r += step
            r = float("%.1f" % r)

        return items
