__author__ = 'attiya'


class QuizResultMixin(object):
    msg = 'No result found'
    img = ''
    html_body = ''

    def get_buzz_feed_result(self):
        """
            Calculate the result of Buzz Feed Quiz type
        """
        outcomes = {}
        for choice in self.student_choices:
            if outcomes.get(self.student_choices[choice]):
                outcomes[self.student_choices[choice]] += 1
            else:
                outcomes[self.student_choices[choice]] = 1

        # get the outcome of user based on user's selected values
        result = self.get_result_by_choices(outcomes)
        self.student_result = result['id']
        final_result = self.get_result(result)
        return final_result

    def get_diagnostic_result(self):

        """
        Calculate the result of Diagnostic Quiz type

        """
        final_result = {
            'msg': 'we cannot calculate your outcome',
            'img': self.img,
            'html_body': 'we cannot calculate your outcome'
        }
        total_value = 0.0
        for choice in self.student_choices.values():
            total_value += float(choice)
        for result in self.results:
            if float(result['min_value']) <= total_value <= float(result['max_value']):
                final_result.clear()
                final_result = self.get_result(result)
                break

        self.student_result = result['name']
        return final_result

    def get_result(self, result):

        """
            save the student result and returns the data of student's result
        """
        self.msg = "You are %s" % str(result['name'])
        if result['image']:
            self.img = result['image']
        self.html_body = result['html_body']
        return {'msg': self.msg, 'img': self.img, 'html_body': self.html_body}

    def get_result_by_choices(self, outcomes):
        max_outcome = max(outcomes.iteritems(), key=lambda v: v[1])[0]
        for result in self.results:
            if max_outcome in result['id']:
                break
        return result

