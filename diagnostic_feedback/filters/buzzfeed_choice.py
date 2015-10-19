from xblock.fields import Scope, String
from .choice import Choice


class BuzzfeedChoice(Choice):
    """

    """

    category_id = ""

    def __init__(self, category_id, name):
        self.category_id = category_id
        self.name = name

    @classmethod
    def get_object(cls, choice):
        return cls(category_id=choice.get('choice_category', ''), name=choice.get('choice_txt').strip())

    def get_json(self):
        return {'name': self.name, 'category_id': self.category_id}

    @classmethod
    def get_choices_json(cls, choices):
        choices_lst = []

        for choice in choices:
            choice = cls.get_object(choice)
            choices_lst.append(choice.get_json())
        return choices_lst
