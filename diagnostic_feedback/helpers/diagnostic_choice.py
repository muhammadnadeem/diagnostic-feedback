from .choice import Choice


class DiagnosticChoice(Choice):
    """
    method to return diagnostic choice json in required format
    """
    value = ""

    def __init__(self, value, name):
        self.value = value
        self.name = name

    @classmethod
    def get_object(cls, choice):
        """
        return object for diagnostic choice
        :param choice: posted choice
        :return: diagnostic choice object
        """
        return cls(value=float(choice.get('choice_value')), name=choice.get('choice_txt').strip())

    def get_json(self):
        """
        return choice json in required format to save
        :return: dict
        """
        return {'name': self.name, 'value': self.value}

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
