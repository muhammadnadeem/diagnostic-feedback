from .validator import Validator


class CategoryValidator(Validator):
    """
        hold methods to validate posted categories
    """

    @classmethod
    def validate(cls, data):
        """
            validate categories for following conditions
            name is required
            image should be a valid url
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
            elif cls.invalid_url(image):
                valid = False
                validation_message = 'image invalid url'
            if not valid:
                break

        return valid, validation_message

