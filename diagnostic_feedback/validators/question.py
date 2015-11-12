from .choice import ChoiceValidator


class QuestionValidator(ChoiceValidator):
    """
        hold methods to validate question with their choices
    """

    @classmethod
    def validate(cls, data, quiz):
        """
        validate questions and their related choices
        :param data: data to validate
        :param quiz: object of xblock
        :return: Boolean, validation message in case of error
        """

        questions = data.get('questions', [])
        valid = True
        validation_message = ''

        if cls.empty_list(questions):
            return False, 'at least one question required'

        for idx, question in enumerate(questions):
            question_order = idx + 1
            _id = question.get('id', '')
            question_title = question.get('question_title', '')
            question_txt = question.get('question_txt', '')
            choices = question.get('choices', [])

            # check for question id availablity
            if cls.is_empty(_id):
                valid = False
                validation_message = 'question {} id required'.format(question_order)

            # check for question title validity
            elif cls.is_empty(question_title):
                valid = False
                validation_message = 'question {} title required'.format(question_order)


            # check for question text validity
            elif cls.is_empty(question_txt):
                valid = False
                validation_message = 'question {} text required'.format(question_order)

            # if question is valid, check its choices validity
            if valid:
                choice_msg = ChoiceValidator.validate(choices, quiz.quiz_type, quiz.BUZ_FEED_QUIZ_VALUE, quiz.results)
                if choice_msg:
                    valid = False
                    validation_message = 'question {} having invalid choices. {}'.format(question_order, choice_msg)

            if not valid:
                break

        return valid, validation_message


