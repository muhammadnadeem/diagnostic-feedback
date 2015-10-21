from . import CategoryValidator, RangeValidator, QuizValidator, QuestionValidator, StudentChoiceValidator


class Validator(object):
    """
    method to validate each step data
    """

    @classmethod
    def validate(cls, quiz, data):
        """
        validate data for an individual step posted from studio view
        :param quiz: xblock object
        :param data: data of each step
        :return:
        """

        step = data['step']
        valid = False
        validation_message = ''

        if step == 1:
            valid, validation_message = QuizValidator.basic_validate(data, quiz)
        elif step == 2 and quiz.quiz_type == quiz.BUZ_FEED_QUIZ_VALUE:
            valid, validation_message = CategoryValidator.validate(data)
        elif step == 2 and quiz.quiz_type == quiz.DIAGNOSTIC_QUIZ_VALUE:
            valid, validation_message = RangeValidator.validate(data)
        elif step == 3:
            valid, validation_message = QuestionValidator.validate(data, quiz)

        return valid, validation_message

    @classmethod
    def validate_student_answer(cls, data):
        """
        validate if question id & student choice is provided
        :param data: answer data to validate
        :return: Boolean, validate message in case of error
        """

        valid, validation_message = StudentChoiceValidator.validate(data)
        return valid, validation_message






