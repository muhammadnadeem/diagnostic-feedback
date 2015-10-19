from xblock.fields import Scope, String, List
import uuid
from .buzzfeed_choice import BuzzfeedChoice
from .diagnostic_choice import DiagnosticChoice


class Question(object):
    """

    """

    id = ""
    title = ""
    choices = ""

    def __init__(self, id, title, choices):
        self.id = id
        self.title = title
        self.choices = choices

    @classmethod
    def get_object(cls, question, choices):
        return cls(id=question.get('id', ''), title=question.get('question_txt', ''), choices=choices)

    def get_json(self):
        return {'id': self.id, 'title': self.title, 'choices': self.choices}

    @classmethod
    def filter_question(cls, data, quiz_type):
        results = []
        questions = data.get('questions')

        for question in questions:
            choices = question.get('choices', [])
            if quiz_type == 'BFQ':
                choices_json = BuzzfeedChoice.get_choices_json(choices)
            else:
                choices_json = DiagnosticChoice.get_choices_json(choices)

            cat = cls.get_object(question, choices_json)
            results.append(cat.get_json())
        return results
