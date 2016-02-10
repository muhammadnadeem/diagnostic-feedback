from .base_validator import BaseValidator


class RangeValidator(BaseValidator):
    """
        hold methods to validate posted ranges
    """

    def bigger_min_val(self, _min, _max):
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

    def validate_via_simple_comparisons(self, range1, range2):
        """
        second algorithm to test if two ranges are overlapping, using basic min/max values comparisons
        :param range1: first range
        :param range2: second range
        :return: Boolean
        """
        r1_min = range1.get('min_value')
        r1_max = range1.get('max_value')
        r1_group = range1.get('group')
        r2_min = range2.get('min_value')
        r2_max = range2.get('max_value')
        r2_group = range2.get('group')
        if r1_min and r1_max and r2_min and r2_max:
            # overlap = range1.min <= range2.max && range2.min <= range1.max;
            overlap = bool(r1_group == r2_group and float(r1_min) <= float(r2_max) and float(r2_min) <= float(r1_max))
            return overlap
        else:
            return True

    def run_basic_validations(self, ranges):
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
            group = _range.get('group')
            order = _range.get('order')

            if self.is_empty(name):
                valid = False
                validation_message = self._('Name is required')
            elif self.is_empty(min_value) or self.is_empty(max_value):
                valid = False
                validation_message = self._('Min/Max values required')
            elif self.bigger_min_val(min_value, max_value):
                valid = False
                validation_message = self._('Min > Max')
            elif self.is_empty(group):
                valid = False
                validation_message = self._('Group is required')
            elif self.is_empty(order):
                valid = False
                validation_message = self._('Order is required')
            if not valid:
                break

        return valid, validation_message

    def run_overlapping_validations(self, ranges):
        """
        check all ranges if any two of them are overlapping
        :param ranges: list of ranges
        :return: Boolean, validation message in case of error
        """
        valid = True
        validation_message = ''

        for idx, _range in enumerate(ranges):
            for range2 in ranges[idx + 1: len(ranges) + 1]:
                if self.validate_via_simple_comparisons(_range, range2):
                    valid = False
                    validation_message = '{} [{} - {}] & [{} - {}]'.format(self._("Overlapping ranges in '{}'")
                                                                           .format(_range.get('group')),
                                                                           _range.get('min_value'),
                                                                           _range.get('max_value'),
                                                                           range2.get('min_value'),
                                                                           range2.get('max_value'))
                if not valid:
                    break

            if not valid:
                break

        return valid, validation_message

    def validate(self, data):
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

        if self.empty_list(ranges):
            return False, self._('At least one range required')

        # Check basic validations
        valid, validation_message = self.run_basic_validations(ranges)

        # If all ranges pass basic validations then check for overlapping ranges
        if valid:
            return self.run_overlapping_validations(ranges)

        return valid, validation_message
