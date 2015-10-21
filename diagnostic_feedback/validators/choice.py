from .base_validator import BaseValidator


class ChoiceValidator(BaseValidator):
    """
        hold methods to validate question choices
    """

    @classmethod
    def invalid_category(cls, category, results):
        """
        check if provided category id exists in actual results list
        :param category:
        :param results:
        :return:
        """
        valid_ids = [result['id'] for result in results]
        return not(category in valid_ids)

    @classmethod
    def validate(cls, choices, quiz_type, BUZ_FEED_QUIZ_VALUE, results):
        """
        validate choices for a given question
        :param choices: list of choices
        :param quiz_type: type of quiz
        :param BUZ_FEED_QUIZ_VALUE: constant value wer are using for buzz feed quiz
        :param results: result list to validate if provided category id exists in actual results list
        :return: only validation message in case of error
        """

        valid = True
        validation_message = ''

        if cls.empty_list(choices):
            return 'choices list is missing'

        for choice in choices:
            choice_txt = choice.get('choice_txt', '')
            choice_category = choice.get('choice_category', '')
            choice_value = choice.get('choice_value', '')

            if cls.is_empty(choice_txt):
                valid = False
                validation_message = 'name required'

            elif quiz_type == BUZ_FEED_QUIZ_VALUE and cls.is_empty(choice_category):
                valid = False
                validation_message = 'category required'

            elif quiz_type == BUZ_FEED_QUIZ_VALUE and cls.invalid_category(choice_category, results):
                valid = False
                validation_message = 'invalid category_id found'

            elif quiz_type != BUZ_FEED_QUIZ_VALUE and cls.is_empty(choice_value):
                valid = False
                validation_message = 'choice value required'

            if not valid:
                break

        return validation_message

