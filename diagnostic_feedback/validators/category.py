from .base_validator import BaseValidator


class CategoryValidator(BaseValidator):
    """
        hold methods to validate posted categories
    """

    @classmethod
    def validate(cls, data):
        """
        validate categories for following conditions
        - name is required
        - image should be a valid url
        :param data: data to validate
        :return: Boolean, validation message if case of error
        """

        categories = data.get('categories', [])
        valid = True
        validation_message = ''

        if cls.empty_list(categories):
            return False, 'at least one category required'

        for category in categories:
            _id = category.get('id', '')
            name = category.get('name', '')
            image = category.get('image', '')

            if cls.is_empty(_id):
                valid = False
                validation_message = 'id is required'
            elif cls.is_empty(name):
                valid = False
                validation_message = 'name is required'
            if not valid:
                break

        return valid, validation_message

