from .base_validator import BaseValidator


class CategoryValidator(BaseValidator):
    """
        hold methods to validate posted categories
    """

    def validate(self, data):
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

        if self.empty_list(categories):
            return False, self._('At least one category required')

        for category in categories:
            _id = category.get('id', '')
            name = category.get('name', '')
            group = category.get('group', '')
            order = category.get('order', '')

            if self.is_empty(_id):
                valid = False
                validation_message = self._('ID is required')
            elif self.is_empty(name):
                valid = False
                validation_message = self._('Name is required')
            elif self.is_empty(group):
                valid = False
                validation_message = self._('Group is required')
            elif self.is_empty(order):
                valid = False
                validation_message = self._('Order is required')
            if not valid:
                break

        return valid, validation_message
