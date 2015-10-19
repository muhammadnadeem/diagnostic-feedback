__author__ = 'attiya'


from .validator import Validator


class StudentChoiceValidator(Validator):


    @classmethod
    def basic_validate(cls, data):
        """
            validate only question id & student choice
        """
        valid = True
        msg = ''

        question_id = data.get('question_id')
        student_choice = data.get('student_choice')

        if cls.is_empty(question_id):
            valid = False
            msg = 'question id is required'
        elif cls.is_empty(student_choice):
            valid = False
            msg = 'Student Choice is required'

        return valid, msg

