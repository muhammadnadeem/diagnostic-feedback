from .base_validator import BaseValidator


class QuizValidator(BaseValidator):
    """
        hold method to validate quiz
    """

    def invalid_quiz_type(self, _type, valid_types):
        """
        check if provided type is valid
        :param _type: type to save
        :param valid_types: list of valid quiz types
        :return: Boolean
        """

        return not (_type in [t['value'] for t in valid_types])

    def validate(self, data):
        """
        validate quiz title & quiz_type
        :param data: quiz data
        :param quiz: object of xblock
        :return: Boolean, validation message in case of error
        """

        # _ = quiz.runtime.service(quiz, "i18n")

        valid = True
        validation_message = ''

        title = data.get('title')
        description = data.get('description')
        _type = data.get('type')

        if self.is_empty(title):
            valid = False
            validation_message = self._('Title is required')
        elif self.is_empty(description):
            valid = False
            validation_message = self._('Description is required')
        elif not self.xblock.quiz_type and self.invalid_quiz_type(_type, self.xblock.types):
            valid = False
            validation_message = self._('Type is invalid')

        return valid, validation_message
