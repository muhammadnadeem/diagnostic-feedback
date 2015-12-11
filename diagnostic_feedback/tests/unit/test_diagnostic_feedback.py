import json
import os
from base_test import BaseTest
from .wizard_step_mixin import WizardStepMixin

from nose.tools import (assert_equals)


class DiagnosticFeedbackAjaxTest(BaseTest, WizardStepMixin):
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
        self._step1_data = None
        self._step2_data = None
        self._step3_buzzfeed_data = None
        self._step3_diagnostic_data = None
        self._block = None
        super(DiagnosticFeedbackAjaxTest, self).__init__(*args, **kwargs)

    @classmethod
    def setUpClass(cls):
        cls._oldMaxDiff = assert_equals.__self__.maxDiff
        assert_equals.__self__.maxDiff = None

    @classmethod
    def tearDownClass(cls):
        assert_equals.__self__.maxDiff = cls._oldMaxDiff

    def setUp(self):
        self._block = self.make_block()
        self._step1_data = self.load_step_data(1)
        self._step2_data = self.load_step_data(2)
        self._step3_buzzfeed_data = self.load_step_data(3, self._block.BUZZFEED_QUIZ_VALUE)
        self._step3_diagnostic_data = self.load_step_data(3, self._block.DIAGNOSTIC_QUIZ_VALUE)

    def tearDown(self):
        self._block = None

    def load_json_resource(self, path):
        return open(os.path.join(os.path.dirname(__file__), '..', path)).read()

    def load_step_data(self, step, quiz_type=None):
        if step == 1:
            return json.loads(self.load_json_resource('data/step1_test_data.json'))
        elif step == 2:
            return json.loads(self.load_json_resource('data/step2_test_data.json'))
        elif step == 3:
            if quiz_type == self._block.BUZZFEED_QUIZ_VALUE:
                return json.loads(self.load_json_resource('data/step3_buzzfeed_test_data.json'))
            else:
                return json.loads(self.load_json_resource('data/step3_diagnostic_test_data.json'))

    def test_wizard_step1(self):

        for _type, data in self._step1_data.items():
            data = json.dumps(data)
            res = json.loads(self._block.handle('save_data', self.make_request(data)).body)

            if _type == 'missing_step':
                assert_equals(res['success'], False)
            elif _type == 'missing_title':
                assert_equals(res['success'], False)
            elif _type == 'invalid_type':
                assert_equals(res['success'], False)
            elif _type == 'missing_title_type':
                assert_equals(res['success'], False)
            elif _type == "missing_description":
                assert_equals(res['success'], False)
            elif _type == 'valid_data':
                assert_equals(res['success'], True)

        assert_equals(self._block.title, 'Test')
        assert_equals(self._block.quiz_type, self._block.DIAGNOSTIC_QUIZ_VALUE)

    def test_buzzfeed_wizard_step2(self):

        assert_equals(len(self._block.results), 0)

        # set quiz as buzzfeed
        res = self.save_wizard_step1(self._block.BUZZFEED_QUIZ_VALUE)
        assert_equals(res['success'], True)

        # test all related cases
        for _type, data in self._step2_data.get('buzzfeed_quiz_data').items():
            data = json.dumps(data)
            res = json.loads(self._block.handle('save_data', self.make_request(data)).body)
            if _type == 'missing_categories':
                assert_equals(res['success'], False)
            elif _type == 'missing_id_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_id_case2':
                assert_equals(res['success'], False)
            elif _type == 'missing_name_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_name_case2':
                assert_equals(res['success'], False)
            elif _type == 'valid':
                assert_equals(res['success'], True)

        assert_equals(len(self._block.results), 2)

    def test_diagnostic_wizard_step2(self):
        assert_equals(len(self._block.results), 0)

        # set quiz as diagnostic
        res = self.save_wizard_step1(self._block.DIAGNOSTIC_QUIZ_VALUE)
        assert_equals(res['success'], True)

        # test all related cases
        for _type, data in self._step2_data.get('diagnostic_quiz_data').items():
            data = json.dumps(data)
            res = json.loads(self._block.handle('save_data', self.make_request(data)).body)

            if _type == 'missing_ranges':
                assert_equals(res['success'], False)
            elif _type == 'missing_name_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_name_case2':
                assert_equals(res['success'], False)
            elif _type == 'min_max_case1':
                assert_equals(res['success'], False)
            elif _type == 'min_max_case2':
                assert_equals(res['success'], False)
            elif _type == 'min_max_case3':
                assert_equals(res['success'], False)
            elif _type == 'overlapping_ranges_case1':
                assert_equals(res['success'], False)
            elif _type == 'overlapping_ranges_case2':
                assert_equals(res['success'], False)
            elif _type == 'overlapping_ranges_case3':
                assert_equals(res['success'], False)
            elif _type == 'valid':
                assert_equals(res['success'], True)

        assert_equals(len(self._block.results), 2)

    def test_buzzfeed_wizard_step3(self):
        assert_equals(len(self._block.results), 0)

        # add buzzfeed quiz
        res = self.save_wizard_step1(self._block.BUZZFEED_QUIZ_VALUE)
        assert_equals(res['success'], True)

        # add categories for buz-feed quiz
        res = self.save_buzzfeed_step2()
        assert_equals(res['success'], True)

        # confirm if categories added
        assert_equals(len(self._block.results), 2)

        assert_equals(len(self._block.questions), 0)
        # test all related cases
        for _type, data in self._step3_buzzfeed_data.items():
            data = json.dumps(data)
            res = json.loads(self._block.handle('save_data', self.make_request(data)).body)

            if _type == 'missing_questions':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_id_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_id_case2':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_txt_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_txt_case2':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_title_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_title_case2':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_choice_category_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_choice_category_case2':
                assert_equals(res['success'], False)
            elif _type == 'invalid_ques_choice_category_case1':
                assert_equals(res['success'], False)
            elif _type == 'invalid_ques_choice_category_case2':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_choices_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_choices_case2':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_choice_txt_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_choice_txt_case2':
                assert_equals(res['success'], False)
            elif _type == 'valid':
                assert_equals(res['success'], True)

        assert_equals(len(self._block.questions), 2)

    def test_diagnostic_wizard_step3(self):
        assert_equals(len(self._block.results), 0)

        # add buzzfeed quiz
        res = self.save_wizard_step1(self._block.DIAGNOSTIC_QUIZ_VALUE)
        assert_equals(res['success'], True)

        # add ranges for dignostic quiz
        res = self.save_diagnostic_step2()
        assert_equals(res['success'], True)

        # confirm if ranges added
        assert_equals(len(self._block.results), 2)

        assert_equals(len(self._block.questions), 0)
        # test all related cases
        for _type, data in self._step3_diagnostic_data.items():
            data = json.dumps(data)
            res = json.loads(self._block.handle('save_data', self.make_request(data)).body)

            if _type == 'missing_questions':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_id_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_id_case2':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_txt_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_txt_case2':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_title_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_title_case2':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_choices_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_choices_case2':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_choice_txt_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_choice_txt_case2':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_choice_value_case1':
                assert_equals(res['success'], False)
            elif _type == 'missing_ques_choice_value_case2':
                assert_equals(res['success'], False)
            elif _type == 'invalid_datatype_choice_value_case1':
                assert_equals(res['success'], False)
            elif _type == 'invalid_datatype_choice_value_case2':
                assert_equals(res['success'], False)

            elif _type == 'valid':
                assert_equals(res['success'], True)

        assert_equals(len(self._block.questions), 2)
