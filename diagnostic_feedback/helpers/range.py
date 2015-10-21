from .result import Result


class Range(Result):
    """
    method to return ranges json in required format
    """

    min_value = 0
    max_value = 0

    def __init__(self, name, min_value, max_value, image='', html_body=''):
        self.name = name
        self.min_value = min_value
        self.max_value = max_value
        if image:
            self.image = image
        if html_body:
            self.html_body = html_body

    @classmethod
    def get_object(cls, _range):
        """
        return object for range
        :param range: posted range
        :return: range object
        """
        return cls(name=_range.get('name').strip(),
                   min_value=_range.get('min_value').strip(), max_value=_range.get('max_value').strip(),
                   image=_range.get('image', ''), html_body=_range.get('html_body', ''))

    def get_json(self):
        """
        return range json in required format to save
        :return: dict
        """
        return {'name': self.name, 'min_value': self.min_value, 'max_value': self.max_value,
                'image': self.image, 'html_body': self.html_body}

    @classmethod
    def filter_results(cls, data):
        """
        get only required data for each posted range
        :param ranges: list of posted ranges
        :return: filtered list of ranges json that will be saved in quiz results field
        """
        results = []
        ranges = data.get('ranges')
        for _range in ranges:
            cat = cls.get_object(_range)
            results.append(cat.get_json())
        return results