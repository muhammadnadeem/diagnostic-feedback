from .choice import Choice


class BuzzfeedChoice(Choice):
    """
    method to return buzz feed choice json in required format
    """

    category_id = ""

    def __init__(self, category_id, name):
        self.category_id = category_id
        self.name = name

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
        return choice json in required format to save
        :return: dict
        """
        return {'name': self.name, 'category_id': self.category_id}

    @classmethod
    def get_choices_json(cls, choices):
        """
        get only required data for each posted choice
        :param choices: list of posted choices
        :return: filtered list of choices json
        """
        choices_lst = []

        for choice in choices:
            choice = cls.get_object(choice)
            choices_lst.append(choice.get_json())
        return choices_lst
