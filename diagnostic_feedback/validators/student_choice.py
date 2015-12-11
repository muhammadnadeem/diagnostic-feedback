from .base_validator import BaseValidator


class StudentChoiceValidator(BaseValidator):
    """
        method to validate student answer
    """

    def validate(self, data):
        """
        validate if user is providing answer of a question
        :param data: posted answer data
        :return: Boolean, validation message in case of error
        """

        valid = True
        validation_message = ''

        question_id = data.get('question_id')
        student_choice = data.get('student_choice')
        current_step = str(data.get('currentStep'))

        if self.is_empty(question_id):
            valid = False
            validation_message = self._('Question id is required')
        elif self.is_empty(student_choice):
            valid = False
            validation_message = self._('Student Choice is required')
        elif self.is_empty(current_step):
            valid = False
            validation_message = self._('Current step is required')

        return valid, validation_message
