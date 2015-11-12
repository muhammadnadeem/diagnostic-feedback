from .buzzfeed_choice import BuzzfeedChoice
from .diagnostic_choice import DiagnosticChoice


class Question(object):
    """
    method to questions json in required format
    """

    id = ""
    title = ""
    text = ""
    choices = ""

    def __init__(self, **params):
        self.id = params['id']
        self.title = params['title']
        self.text = params['text']
        self.choices = params['choices']

    @classmethod
    def get_object(cls, question, choices):
        """
        return object of a question
        :param question: posted question
        :param choices: posted choices for each question
        :return: question object
        """
        return cls(id=question.get('id', ''), title=question.get('question_title', ''),
                   text=question.get('question_txt', ''), choices=choices)

    def get_json(self):
        """
        return question json in required format to save
        :return: dict
        """
        return {'id': self.id, 'title': self.title, 'text': self.text, 'choices': self.choices}

    @classmethod
    def filter_question(cls, data, quiz_type):
        """
        get only required data for each posted question
        :param data: list of posted questions
        :param quiz_type: type of quiz
        :return: filtered list of questions json
        """
        results = []
        questions = data.get('questions')

        for question in questions:
            choices = question.get('choices', [])
            if quiz_type == 'BFQ':
                choices_json = BuzzfeedChoice.get_choices_json(choices)
            else:
                choices_json = DiagnosticChoice.get_choices_json(choices)

            qs = cls.get_object(question, choices_json)
            results.append(qs.get_json())
        return results
