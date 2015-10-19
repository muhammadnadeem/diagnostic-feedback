from .result import Result


class Category(Result):
    """

    """
    id = ''

    def __init__(self, id, name, image='', html_body=''):
        self.id = id
        self.name = name
        if image:
            self.image = image
        if html_body:
            self.html_body = html_body

    @classmethod
    def get_object(cls, category):
        return cls(id=category.get('id', ''), name=category.get('name').strip(), image=category.get('image', ''),
                   html_body=category.get('html_body', ''))

    def get_json(self):
        return {'id': self.id, 'name': self.name, 'image': self.image, 'html_body': self.html_body}


    @classmethod
    def filter_results(cls, data):
        results = []
        categories = data.get('categories')

        for category in categories:
            cat = cls.get_object(category)
            results.append(cat.get_json())
        return results
