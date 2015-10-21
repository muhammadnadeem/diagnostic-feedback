

class BaseValidator(object):
    """
        generic method to validate values
    """

    @classmethod
    def is_empty(cls, value):
        """
        check for empty string
        :param value: string to test
        :return: Boolean
        """
        return not value.strip()

    @classmethod
    def invalid_url(cls, url):
        """
        check for valid url
        :param value: url to test
        :return: Boolean
        """
        return url.strip() and not url.strip().startswith('http')

    @classmethod
    def empty_list(cls, lst):
        """
        check if a list is empty
        :param lst: list to test
        :return:Boolean
        """
        return not bool(lst)

    @classmethod
    def drange(cls, start, stop, step):
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
