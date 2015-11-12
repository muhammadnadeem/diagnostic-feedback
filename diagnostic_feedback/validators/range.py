from .base_validator import BaseValidator


class RangeValidator(BaseValidator):
    """
        hold methods to validate posted ranges
    """

    @classmethod
    def bigger_min_val(cls, _min, _max):
        """
        check if min value max value
        :param _min: min value
        :param _max: max value
        :return: Boolean
        """
        """
            check if min value is > max value
        """
        return min and max and float(_min) >= float(_max)

    @classmethod
    def validate_via_arrays_comparisons(cls, range1, range2):
        """
        first algorithm to test if two ranges are overlapping, using lists to find overlap
        :param range1: first range
        :param range2: second range
        :return: Boolean
        """

        r1_min = range1.get('min_value')
        r1_max = range1.get('max_value')
        r2_min = range2.get('min_value')
        r2_max = range2.get('max_value')
        if r1_min and r1_max and r2_min and r2_max:
            range1 = cls.drange(float(r1_min), float(r1_max), 0.1)
            range2 = cls.drange(float(r2_min), float(r2_max), 0.1)
            return bool(set(range1) & set(range2))
        else:
            return True

    @classmethod
    def validate_via_simple_comparisons(cls, range1, range2):
        """
        second algorithm to test if two ranges are overlapping, using basic min/max values comparisons
        :param range1: first range
        :param range2: second range
        :return: Boolean
        """
        r1_min = range1.get('min_value')
        r1_max = range1.get('max_value')
        r2_min = range2.get('min_value')
        r2_max = range2.get('max_value')
        if r1_min and r1_max and r2_min and r2_max:
            #overlap = range1.min <= range2.max && range2.min <= range1.max;
            overlap = bool(float(r1_min) <= float(r2_max) and float(r2_min) <= float(r1_max))
            return overlap
        else:
            return True

    @classmethod
    def run_basic_validations(cls, ranges):
        """
        validate ranges for empty names, valid urls, min < max
        :param ranges: list of all ranges
        :return: Boolean, validation message in case of error
        """
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
        """
        check all ranges if any two of them are overlapping
        :param ranges: list of ranges
        :return: Boolean, validation message in case of error
        """
        valid = True
        validation_message = ''

        for idx, _range in enumerate(ranges):
            for range2 in ranges[idx + 1: len(ranges) + 1]:
                if cls.validate_via_simple_comparisons(_range, range2):
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
        validate ranges for following conditions
        - name not empty
        - image url is valid url
        - min < max for each range
        - not any two ranges overlapping
        :param data: data to validate
        :return: Boolean, validate message in case of error
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

