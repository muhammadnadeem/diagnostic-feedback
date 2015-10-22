from .choice import Choice


class DiagnosticChoice(Choice):
    """
    method to return diagnostic choice json in required format
    """
    value = ""

    def __init__(self, **params):
        self.value = params['value']
        self.name = params['name']

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

