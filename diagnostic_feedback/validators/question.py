from .base_validator import BaseValidator


class QuestionValidator(BaseValidator):
    """
        hold methods to validate question with their choices
    """

    def invalid_category(self, category):
        """
        check if provided category id exists in actual results list
        :param category:
        :return:
        """
        valid_ids = [result['id'] for result in self.xblock.results]
        return not (category in valid_ids)

    def validate_choice(self, choices):
        """
        validate choices for a given question
        :param choices: list of choices
        :return: only validation message in case of error
        """

        valid = True
        validation_message = ''

        if self.empty_list(choices):
            return self._('Choices list is missing')

        for choice in choices:
            choice_txt = choice.get('choice_txt', '')
            choice_category = choice.get('choice_category', '')
            choice_value = choice.get('choice_value', '')

            if self.is_empty(choice_txt):
                valid = False
                validation_message = self._('Name required')

            elif self.xblock.quiz_type == self.xblock.BUZZFEED_QUIZ_VALUE and self.is_empty(choice_category):
                valid = False
                validation_message = self._('Category required')

            elif self.xblock.quiz_type == self.xblock.BUZZFEED_QUIZ_VALUE and self.invalid_category(choice_category):
                valid = False
                validation_message = self._('Invalid category_id found')

            elif self.xblock.quiz_type != self.xblock.BUZZFEED_QUIZ_VALUE and self.is_empty(choice_value):
                valid = False
                validation_message = self._('Choice value required')

            if not valid:
                break

        return validation_message

    def validate(self, data):
        """
        validate questions and their related choices
        :param data: data to validate
        :return: Boolean, validation message in case of error
        """

        questions = data.get('questions', [])
        valid = True
        validation_message = ''

        if self.empty_list(questions):
            return False, self._('At least one question required')

        for idx, question in enumerate(questions):
            question_order = idx + 1
            _id = question.get('id', '')
            question_title = question.get('question_title', '')
            question_txt = question.get('question_txt', '')
            choices = question.get('choices', [])

            # check for question id availablity
            if self.is_empty(_id):
                valid = False
                validation_message = '{} {} {}'.format(self._("question"), question_order, self._("id required"))

            # check for question title validity
            elif self.is_empty(question_title):
                valid = False
                validation_message = '{} {} {}'.format(self._("question"), question_order, self._("title required"))

            # check for question text validity
            elif self.is_empty(question_txt):
                valid = False
                validation_message = ' {} {} {}'.format(self._('question'), question_order, self._("text required"))

            # if question is valid, check its choices validity
            if valid:
                choice_msg = self.validate_choice(choices)
                if choice_msg:
                    valid = False
                    validation_message = '{} {} {} {}'.format(self._("question"), question_order,
                                                              self._("having invalid choices."), choice_msg)

            if not valid:
                break

        return valid, validation_message
