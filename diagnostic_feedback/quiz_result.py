import itertools
import copy
import logging
from collections import defaultdict

log = logging.getLogger(__name__)


class StudentResultPresenter(object):
    html_body = ''

    def __init__(self, **data):
        self.html_body = data.get('html_body', '')

    def generate_result(self):
        return {_property: getattr(self, _property) for _property in dir(self) if
                not _property.startswith('__') and not callable(getattr(self, _property))}


class QuizResultMixin(object):
    """
    Return result to student at a quiz completed
    """

    def get_buzzfeed_result(self):
        """
            Calculate the result of BuzzFeed Quiz type
        """
        final_result = []

        outcomes = {}
        for choice in self.student_choices:
            if outcomes.get(self.student_choices[choice]):
                outcomes[self.student_choices[choice]] += 1
            else:
                outcomes[self.student_choices[choice]] = 1

        keys = outcomes.keys()
        calculated_results = copy.deepcopy(self.results)
        for d in calculated_results:
            if d['id'] in outcomes:
                d.update({'count': outcomes[d['id']]})

        filtered_results = filter(lambda d: d['id'] in keys, calculated_results)
        sorted_results = sorted(filtered_results, key=lambda d: d['group'])
        groups = itertools.groupby(sorted_results, lambda item: item["group"])

        for key, group in groups:
            log.info("Info: Calculating result for {}".format(key))
            group = list(group)
            m = max([d['count'] for d in group])
            group_max_result = [d for d in group if d['count'] == m]
            group_min_order = min(group_max_result, key=lambda d: d['order'])
            final_result.append(group_min_order)

        if not final_result:
            final_result.append({
                'id': '',
                'name': '',
                'image': '',
                'html_body': 'we cannot calculate your outcome',
            })

        return final_result

    def get_diagnostic_result(self):

        """
        Calculate the result of Diagnostic Quiz type

        """
        final_result = []

        question_groups = {q['id']: q['group'] for q in self.questions}
        outcomes = defaultdict(int)
        for choice, value in self.student_choices.iteritems():
            outcomes[question_groups[choice]] += float(value)

        for result in self.results:
            value = outcomes[result['group']]
            if float(result['min_value']) <= value <= float(result['max_value']):
                final_result.append(result)

        if not final_result:
            final_result.append({
                'name': '',
                'min_value': '',
                'max_value': '',
                'image': '',
                'html_body': 'we cannot calculate your outcome'
            })
        return final_result

    def get_result(self):
        """
        Get result for student based on his/her answer'
        """

        if self.quiz_type == self.BUZZFEED_QUIZ_VALUE:
            results = self.get_buzzfeed_result()
        else:
            results = self.get_diagnostic_result()

        final_html = ''
        student_results = []
        for result in results:
            student_results.append(result['name'])
            html_body = result['html_body']
            if result['image']:
                html_body = '<img class="result-img" src="{}" alt="{}">{}'.format(result['image'], result['name'],
                                                                                  result['html_body'])
            final_html += '<div class="result">{}</div><hr>'.format(html_body)

        self.student_result = ", ".join(student_results)

        replace_urls = getattr(self.runtime, 'replace_urls', lambda html: html)
        html_body = replace_urls(final_html)

        presenter = StudentResultPresenter(html_body=html_body)
        result = presenter.generate_result()

        return result
