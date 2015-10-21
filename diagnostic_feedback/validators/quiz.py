from .base_validator import BaseValidator


class QuizValidator(BaseValidator):
    """
        hold method to validate quiz
    """


    @classmethod
    def invalid_quiz_type(cls, _type, valid_types):
        """
        check if provided type is valid
        :param _type: type to save
        :param valid_types: list of valid quiz types
        :return: Boolean
        """

        return not(_type in [t['value'] for t in valid_types])

    @classmethod
    def basic_validate(cls, data, quiz):
        """
        validate quiz title & quiz_type
        :param data: quiz data
        :param quiz: object of xblock
        :return: Boolean, validation message in case of error
        """

        valid = True
        validation_message = ''

        title = data.get('title')
        description = data.get('description')
        _type = data.get('type')

        if cls.is_empty(title):
            valid = False
            validation_message = 'title is required'
        elif cls.is_empty(description):
            valid = False
            validation_message = 'description is required'
        elif not quiz.quiz_type and cls.invalid_quiz_type(_type, quiz.types):
            valid = False
            validation_message = 'type is invalid'

        return valid, validation_message

