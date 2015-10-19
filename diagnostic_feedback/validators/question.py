from .choice import ChoiceValidator


class QuestionValidator(ChoiceValidator):
    """
        hold methods to validate question with their choices
    """

    @classmethod
    def validate(cls, data, quiz):
        """
            validate questions and their choices
        """

        questions = data.get('questions', [])
        valid = True
        msg = ''

        if cls.empty_list(questions):
            return False, 'at least one question required'

        for idx, question in enumerate(questions):
            question_order = idx + 1
            _id = question.get('id', '')
            question_txt = question.get('question_txt', '')
            choices = question.get('choices', [])

            # check for question id availablity
            if cls.is_empty(_id):
                valid = False
                msg = 'question {} id required'.format(question_order)

            # check for question text validity
            elif cls.is_empty(question_txt):
                valid = False
                msg = 'question {} text required'.format(question_order)

            # if question is valid, check its choices validity
            if valid:
                choice_msg = ChoiceValidator.validate(choices, quiz.quiz_type, quiz.BUZ_FEED_QUIZ_VALUE, quiz.results)
                if choice_msg:
                    valid = False
                    msg = 'question {} having invalid choices. {}'.format(question_order, choice_msg)

            if not valid:
                break

        return valid, msg


