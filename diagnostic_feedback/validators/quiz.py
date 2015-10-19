from .validator import Validator


class QuizValidator(Validator):

    @classmethod
    def invalid_quiz_type(cls, _type, valid_types):
        """
            check if provided type is valid
        """
        return not(_type in [t['value'] for t in valid_types])

    @classmethod
    def basic_validate(cls, data, quiz):
        """
            validate only title & quiz_type
        """
        valid = True
        msg = ''

        title = data.get('title')
        description = data.get('description')
        _type = data.get('type')

        if cls.is_empty(title):
            valid = False
            msg = 'title is required'
        elif cls.is_empty(description):
            valid = False
            msg = 'description is required'
        elif not quiz.quiz_type and cls.invalid_quiz_type(_type, quiz.types):
            valid = False
            msg = 'type is invalid'

        return valid, msg

