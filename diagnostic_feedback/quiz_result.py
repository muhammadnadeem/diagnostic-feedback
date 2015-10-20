__author__ = 'attiya'


class QuizResultMixin(object):
    msg = 'No result found'
    img = ''
    html_body = ''

    # Calculate the result of Buzz Feed Quiz type
    def get_buzz_feed_result(self):
        outcomes = {}
        for choice in self.student_choices:
            if outcomes.get(self.student_choices[choice]):
                outcomes[self.student_choices[choice]] += 1
            else:
                outcomes[self.student_choices[choice]] = 1

        # get the outcome of user based on user's selected values
        max_outcome = max(outcomes.iteritems(), key=lambda v: v[1])[0]
        for result in self.results:
            if max_outcome in result['id']:
                final_result = self.get_result(result)
                break
        return final_result

    # Calculate the result of Diagnostic Quiz type
    def get_diagnostic_result(self):
        final_result = {'msg': 'we cannot calculate your outcome', 'img': self.img, 'html_body': self.html_body}
        total_value = 0.0
        for choice in self.student_choices.values():
            total_value += float(choice)
        for result in self.results:
            if float(result['min_value']) <= total_value <= float(result['max_value']):
                final_result.clear()
                final_result = self.get_result(result)
                break
        return final_result

    # save the student result and returns the data of student's result
    def get_result(self, result):
        self.msg = "You are %s" % str(result['name'])
        if result['image'] in result:
            self.img = result['image']
        self.html_body = result['html_body']
        result = "%s , your image url is %s and html body is %s" % (self.msg, str(self.img), str(self.html_body))
        self.student_result = result
        return {'msg': self.msg, 'img': self.img, 'html_body': self.html_body}
