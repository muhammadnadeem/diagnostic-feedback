from .validator import Validator


class RangeValidator(Validator):
    """
        hold methods to validate posted categories
    """

    @classmethod
    def bigger_min_val(cls, min, max):
        """
            check if min value is > max value
        """
        return min and max and float(min) >= float(max)

    @classmethod
    def overlapping_ranges(cls, range1, range2):
        """
            check if both range are overlapping
        """

        r1_min_val = range1.get('min_value')
        r1_max_val = range1.get('max_value')
        r2_min_val = range2.get('min_value')
        r2_max_val = range2.get('max_value')
        if r1_min_val and r1_max_val and r2_min_val and r2_max_val:
            range1 = cls.drange(float(r1_min_val), float(r1_max_val), 0.1)
            range2 = cls.drange(float(r2_min_val), float(r2_max_val), 0.1)
            return bool(set(range1) & set(range2))
        else:
            return True

    @classmethod
    def run_basic_validations(cls, ranges):
        valid = True
        validation_message = ''

        for _range in ranges:
            name = _range.get('name')
            min_value = _range.get('min_value')
            max_value = _range.get('max_value')
            image = _range.get('image')

            if cls.is_empty(name):
                valid = False
                validation_message = 'name is required'
            elif cls.invalid_url(image):
                valid = False
                validation_message = 'image invalid url'
            elif cls.is_empty(min_value) or cls.is_empty(max_value):
                valid = False
                validation_message = 'min/max values required'
            elif cls.bigger_min_val(min_value, max_value):
                valid = False
                validation_message = 'min > max'

            if not valid:
                break

        return valid, validation_message

    @classmethod
    def run_overlapping_validations(cls, ranges):
        valid = True
        validation_message = ''

        for idx, _range in enumerate(ranges):
            for range2 in ranges[idx + 1: len(ranges) + 1]:
                if cls.overlapping_ranges(_range, range2):
                    valid = False
                    validation_message = 'overlapping ranges [{} - {}] & [{} - {}]'.format(_range.get('min_value'),
                                                                            _range.get('max_value'),
                                                                            range2.get('min_value'),
                                                                            range2.get('max_value'))
                if not valid:
                    break

            if not valid:
                break

        return valid, validation_message

    @classmethod
    def validate(cls, data):
        """
            validate categories for following conditions
            name is required
            image should be a valid url
        """
        ranges = data.get('ranges', [])

        if cls.empty_list(ranges):
            return False, 'at least one range required'

        # Check basic validations
        valid, validation_message = cls.run_basic_validations(ranges)

        # If all ranges pass basic validations then check for overlapping ranges
        if valid:
            return cls.run_overlapping_validations(ranges)

        return valid, validation_message

