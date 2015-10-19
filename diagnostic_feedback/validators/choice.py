from .validator import Validator


class ChoiceValidator(Validator):
    """
        hold methods to validate question choices
    """

    @classmethod
    def invalid_category(cls, category, results):
        valid_ids = [result['id'] for result in results]
        return not(category in valid_ids)

    @classmethod
    def validate(cls, choices, quiz_type, BUZ_FEED_QUIZ_VALUE, results):
        """
            validate choices for a given question
        """

        valid = True
        msg = ''

        if cls.empty_list(choices):
            return 'choices list is missing'

        for choice in choices:
            choice_txt = choice.get('choice_txt', '')
            choice_category = choice.get('choice_category', '')
            choice_value = choice.get('choice_value', '')

            if cls.is_empty(choice_txt):
                valid = False
                msg = 'name required'

            elif quiz_type == BUZ_FEED_QUIZ_VALUE and cls.is_empty(choice_category):
                valid = False
                msg = 'category required'

            elif quiz_type == BUZ_FEED_QUIZ_VALUE and cls.invalid_category(choice_category, results):
                valid = False
                msg = 'invalid category_id found'

            elif quiz_type != BUZ_FEED_QUIZ_VALUE and cls.is_empty(choice_value):
                valid = False
                msg = 'choice value required'

            # elif quiz_type != BUZ_FEED_QUIZ_VALUE and cls.invalid_range(choice_value, results):
            #     valid = False
            #     msg = 'invalid range value found'

            if not valid:
                break

        return msg

