from .choice import Choice


class BuzzfeedChoice(Choice):
    """
    method to return buzz feed choice' json in required format
    """

    category_id = ""

    def __init__(self, **params):
        self.category_id = params['category_id']
        self.name = params['name']

    @classmethod
    def get_object(cls, choice):
        """
        return object for buzz feed choice
        :param choice: posted choice
        :return: buzz feed choice object
        """
        return cls(category_id=choice.get('choice_category', ''), name=choice.get('choice_txt').strip())

    def get_json(self):
        """
        return choice' json in required format to save
        :return: dict
        """
        return {'name': self.name, 'category_id': self.category_id}
