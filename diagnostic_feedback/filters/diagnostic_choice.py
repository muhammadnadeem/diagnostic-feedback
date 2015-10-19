from .choice import Choice


class DiagnosticChoice(Choice):
    """

    """
    value = ""


    def __init__(self, value, name):
        self.value = value
        self.name = name

    @classmethod
    def get_object(cls, choice):
        return cls(value=float(choice.get('choice_value')), name=choice.get('choice_txt').strip())

    def get_json(self):
        return {'name': self.name, 'value': self.value}

    @classmethod
    def get_choices_json(cls, choices):
        choices_lst = []

        for choice in choices:
            choice = cls.get_object(choice)
            choices_lst.append(choice.get_json())
        return choices_lst
