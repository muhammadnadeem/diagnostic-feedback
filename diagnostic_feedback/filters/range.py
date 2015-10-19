from .result import Result


class Range(Result):
    """

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
    def get_object(cls, range):
        return cls(name=range.get('name').strip(),
                   min_value=range.get('min_value').strip(), max_value=range.get('max_value').strip(),
                   image=range.get('image', ''), html_body=range.get('html_body', ''))

    def get_json(self):
        return {'name': self.name, 'min_value': self.min_value, 'max_value': self.max_value,
                'image': self.image, 'html_body': self.html_body}

    @classmethod
    def filter_results(cls, data):
        results = []
        ranges = data.get('ranges')
        for _range in ranges:
            cat = cls.get_object(_range)
            results.append(cat.get_json())
        return results