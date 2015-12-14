import json
import os
from base_test import BaseTest
from .wizard_step_mixin import WizardStepMixin

from nose.tools import (assert_equals)


class StudentViewAjaxTest(BaseTest, WizardStepMixin):
    _oldMaxDiff = None

    ZONE_1 = None
    ZONE_2 = None

    FEEDBACK = {
        0: {"correct": None, "incorrect": None},
        1: {"correct": None, "incorrect": None},
        2: {"correct": None, "incorrect": None}
    }

    FINAL_FEEDBACK = None

    def __init__(self, *args, **kwargs):
        self._block = None
        super(StudentViewAjaxTest, self).__init__(*args, **kwargs)

    @classmethod
    def setUpClass(cls):
        cls._oldMaxDiff = assert_equals.__self__.maxDiff
        assert_equals.__self__.maxDiff = None

    @classmethod
    def tearDownClass(cls):
        assert_equals.__self__.maxDiff = cls._oldMaxDiff

    def load_json_resource(self, path):
        return open(os.path.join(os.path.dirname(__file__), '..', path)).read()

    def setUp(self):
        self._block = self.make_block()
        self._daignostic_answer = json.loads(self.load_json_resource('data/answer_diagnostic_test_data.json'))
        self._buzzfeed_answer = json.loads(self.load_json_resource('data/answer_buzzfeed_test_data.json'))

    def test_diagnostic_answer(self):

        # add diagnostic quiz
        res = self.save_wizard_step1(self._block.DIAGNOSTIC_QUIZ_VALUE)
        assert_equals(res['success'], True)

        # add ranges for diagnostic quiz
        res = self.save_diagnostic_step2()
        assert_equals(res['success'], True)

        # add Questions for diagnostic Quiz
        res = self.save_diagnostic_step3()
        assert_equals(res['success'], True)

        for question_data in self._block.questions:
            for _type, data in self._daignostic_answer.items():
                if _type == 'missing_id':
                    data['question_id'] = ''
                else:
                    data['question_id'] = question_data["id"]
                json_data = json.dumps(data)
                res = json.loads(self._block.handle('save_choice', self.make_request(json_data)).body)
                if _type == 'missing_choice':
                    assert_equals(res['success'], False)
                elif _type == 'missing_id':
                    assert_equals(res['success'], False)
                elif _type == 'missing_step':
                    assert_equals(res['success'], False)
                if _type == 'valid_data':
                    if data['isLast'] == "True":
                        assert_equals(res['success'], True)
                    else:
                        assert_equals(res['success'], True)

    def test_buzzfeed_answer(self):

        # set quiz as buzzfeed
        res = self.save_wizard_step1(self._block.BUZZFEED_QUIZ_VALUE)
        assert_equals(res['success'], True)

        # set categories for buzzfeed quiz
        res = self.save_buzzfeed_step2()
        assert_equals(res['success'], True)

        # set questions for buzzfeed Quiz
        res = self.save_buzzfeed_step3()
        assert_equals(res['success'], True)

        for question_data in self._block.questions:
            for _type, data in self._buzzfeed_answer.items():
                if _type == 'missing_id':
                    data['question_id'] = ''
                else:
                    data['question_id'] = question_data["id"]
                json_data = json.dumps(data)
                res = json.loads(self._block.handle('save_choice', self.make_request(json_data)).body)
                if _type == 'missing_choice':
                    assert_equals(res['success'], False)
                elif _type == 'missing_id':
                    assert_equals(res['success'], False)
                elif _type == 'missing_step':
                    assert_equals(res['success'], False)
                elif _type == 'valid_data':
                    if data['isLast'] == "True":
                        assert_equals(res['success'], True)
                    else:
                        assert_equals(res['success'], True)

    def tearDown(self):
        self._block = None
