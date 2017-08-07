import json

from xblock.field_data import DictFieldData

from base_test import BaseTest
from diagnostic_feedback.quiz import QuizBlock
from ..utils import MockRuntime


class StudentViewDataTest(BaseTest):
    """
    Tests for XBlock Diagnostic Feedback. Student View Data
    """
    def setUp(self):
        """
        Test case setup
        """
        super(StudentViewDataTest, self).setUp()
        self.runtime = MockRuntime()
        self.diagnostic_feedback_data = {
            'questions': [
                {
                    'group': 'Default Group',
                    'title': 'Test Title',
                    'text': '<p>Test Question Text</p>',
                    'choices': [
                        {
                            'name': '<p>Dummy</p>'
                        },
                        {
                            'name': '<p>Test Dummy</p>'
                        }
                    ],
                }
            ],
            'title': 'New Quiz',
            'quiz_type': 'BFQ'
        }

        self.diagnostic_feedback_block = QuizBlock(
            self.runtime,
            DictFieldData(self.diagnostic_feedback_data),
            None
        )

    def test_student_view_data(self):
        """
        Test the student_view_data results.
        """
        expected_diagnostic_feedback_data = {
            'quiz_type': self.diagnostic_feedback_data['quiz_type'],
            'quiz_title': self.diagnostic_feedback_data['title'],
            'questions': self.diagnostic_feedback_data['questions'],
        }

        student_view_data = self.diagnostic_feedback_block.student_view_data()
        self.assertEqual(student_view_data, expected_diagnostic_feedback_data)

    def test_student_view_user_state_handler(self):
        """
        Test the student_view_user_state handler results.
        """
        response = json.loads(
            self.diagnostic_feedback_block.handle(
                'student_view_user_state',
                self.make_request('', method='GET')
            ).body
        )
        expected_diagnostic_feedback_response = {
            u'student_choices': {},
            u'student_result': u'',
            u'current_step': 0,
            u'completed': False,
        }
        self.assertEqual(response, expected_diagnostic_feedback_response)
