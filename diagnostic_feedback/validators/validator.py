from . import CategoryValidator, RangeValidator, QuizValidator, QuestionValidator, StudentChoiceValidator


class Validator(object):
    """
    method to validate each step data
    """
    @classmethod
    def validate(cls, xblock, data):
        """
        validate data for an individual step posted from studio view
        :param xblock: xblock object
        :param data: data of each step
        :return:
        """
        step = data['step']
        obj = None

        if step == 1:
            obj = QuizValidator(xblock=xblock)
        elif step == 2 and xblock.quiz_type == xblock.BUZZFEED_QUIZ_VALUE:
            obj = CategoryValidator(xblock=xblock)
        elif step == 2 and xblock.quiz_type == xblock.DIAGNOSTIC_QUIZ_VALUE:
            obj = RangeValidator(xblock=xblock)
        elif step == 3:
            obj = QuestionValidator(xblock=xblock)

        valid, validation_message = obj.validate(data)
        return valid, validation_message

    @classmethod
    def validate_student_answer(cls, xblock, data):
        """
        validate if question id & student choice is provided
        :param data: answer data to validate
        :param xblock: xblock object
        :return: Boolean, validate message in case of error
        """
        obj = StudentChoiceValidator(xblock=xblock)
        valid, validation_message = obj.validate(data)
        return valid, validation_message
