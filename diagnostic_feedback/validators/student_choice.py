from .base_validator import BaseValidator


class StudentChoiceValidator(BaseValidator):
    """
        method to validate student answer
    """

    @classmethod
    def validate(cls, data):
        """
        validate if user is providing answer of a question
        :param data: posted answer data
        :return: Boolean, validation message in case of error
        """
        """
            validate only question id & student choice
        """
        valid = True
        validation_message = ''

        question_id = data.get('question_id')
        student_choice = data.get('student_choice')

        if cls.is_empty(question_id):
            valid = False
            validation_message = 'question id is required'
        elif cls.is_empty(student_choice):
            valid = False
            validation_message = 'Student Choice is required'

        return valid, validation_message

