class Choice(object):
    """
    hold shared attributes of buzzfeed/diagnostic choices
    """

    name = ""

    def get_json(self):
        pass

    @classmethod
    def get_object(cls, choice):
        pass

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
