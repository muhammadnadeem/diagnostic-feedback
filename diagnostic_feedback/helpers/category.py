from .result import Result


class Category(Result):
    """
    method to return categories' json in required format
    """

    id = ''

    def __init__(self, **params):
        self.id = params['id']
        self.name = params['name']
        self.internal_description = params['internal_description']
        self.image = params['image']
        self.html_body = params['html_body']

    @classmethod
    def get_object(cls, category):
        """
        return object for category
        :param category: posted category
        :return: category object
        """
        return cls(id=category.get('id', ''), name=category.get('name').strip(), image=category.get('image', ''),
                   internal_description=category.get('internal_description', ''),
                   html_body=category.get('html_body', ''))

    def get_json(self):
        """
        return category's json in required format to save
        :return: dict
        """
        return {'id': self.id, 'name': self.name, 'image': self.image,
                'internal_description': self.internal_description,
                'html_body': self.html_body}

    @classmethod
    def filter_results(cls, data):
        """
        get only required data for each posted category
        :param choices: list of posted categories
        :return: filtered list of categories' json that will be saved in quiz results field
        """
        results = []
        categories = data.get('categories')

        for category in categories:
            cat = cls.get_object(category)
            results.append(cat.get_json())

        return results
