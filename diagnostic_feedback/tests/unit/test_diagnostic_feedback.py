import json
import os
from base_test import BaseTest
from .wizard_step_mixin import WizardStepMixin

from nose.tools import (
    assert_equals, assert_true, assert_false,
    assert_in
)


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
        self._step3_buzzfeed_data = self.load_step_data(3, self._block.BUZ_FEED_QUIZ_VALUE)
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
            if quiz_type == self._block.BUZ_FEED_QUIZ_VALUE:
                return json.loads(self.load_json_resource('data/step3_buzfeed_test_data.json'))
            else:
                return json.loads(self.load_json_resource('data/step3_diagnostic_test_data.json'))

    def test_wizard_step1(self):

        for _type, data in self._step1_data.items():
            data = json.dumps(data)
            res = json.loads(self._block.handle('save_data', self.make_request(data)).body)

            if _type == 'missing_step':
                assert_equals(res, {u'success': False, u"step": u"", u'msg': u'missing step number'})
            elif _type == 'missing_title':
                assert_equals(res, {u'success': False, u"step": 1, u'msg': u'title is required'})
            elif _type == 'invalid_type':
                assert_equals(res, {u'success': False, u"step": 1, u'msg': u'type is invalid'})
            elif _type == 'missing_title_type':
                assert_equals(res, {u'success': False, u"step": 1, u'msg': u'title is required'})
            elif _type == "missing_description" :
                assert_equals(res, {u'success': False, u"step": 1, u'msg': u'description is required'})
            elif _type == 'valid_data':
                assert_equals(res, {u'success': True, u"step": 1, u'msg': u'step 1 data saved'})

        assert_equals(self._block.title, 'Test')
        assert_equals(self._block.quiz_type, self._block.DIAGNOSTIC_QUIZ_VALUE)


    def test_buzfeed_wizard_step2(self):

        assert_equals(len(self._block.results), 0)

        # set quiz as buzfeed
        res = self.save_wizard_step1(self._block.BUZ_FEED_QUIZ_VALUE)
        assert_equals(res['success'], True)

        # test all related cases
        for _type, data in self._step2_data.get('buzfeed_quiz_data').items():
            data = json.dumps(data)
            res = json.loads(self._block.handle('save_data', self.make_request(data)).body)
            if _type == 'missing_categories':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'at least one category required'})
            elif _type == 'missing_id_case1':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'id is required'})
            elif _type == 'missing_id_case2':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'id is required'})
            elif _type == 'missing_name_case1':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'name is required'})
            elif _type == 'missing_name_case2':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'name is required'})
            elif _type == 'invalid_image_case1':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'image invalid url'})
            elif _type == 'invalid_image_case2':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'image invalid url'})
            elif _type == 'valid':
                assert_equals(res, {u'success': True, u"step": 2, u'msg': u'step 2 data saved'})

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
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'at least one range required'})
            elif _type == 'missing_name_case1':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'name is required'})
            elif _type == 'missing_name_case2':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'name is required'})
            elif _type == 'invalid_image_case1':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'image invalid url'})
            elif _type == 'invalid_image_case2':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'image invalid url'})

            elif _type == 'min_max_case1':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'min/max values required'})
            elif _type == 'min_max_case2':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'min > max'})
            elif _type == 'min_max_case3':
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'min > max'})

            elif _type == 'overlapping_ranges_case1':
                data = json.loads(data)
                ranges = data['ranges']
                error_message = 'overlapping ranges [{} - {}] & [{} - {}]'.format(ranges[0].get('min_value'),
                                                                            ranges[0].get('max_value'),
                                                                            ranges[1].get('min_value'),
                                                                            ranges[1].get('max_value'))
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'{}'.format(error_message)})
            elif _type == 'overlapping_ranges_case2':
                data = json.loads(data)
                ranges = data['ranges']
                error_message = 'overlapping ranges [{} - {}] & [{} - {}]'.format(ranges[0].get('min_value'),
                                                                            ranges[0].get('max_value'),
                                                                            ranges[2].get('min_value'),
                                                                            ranges[2].get('max_value'))
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'{}'.format(error_message)})
            elif _type == 'overlapping_ranges_case3':
                data = json.loads(data)
                ranges = data['ranges']
                error_message = 'overlapping ranges [{} - {}] & [{} - {}]'.format(ranges[1].get('min_value'),
                                                                            ranges[1].get('max_value'),
                                                                            ranges[2].get('min_value'),
                                                                            ranges[2].get('max_value'))
                assert_equals(res, {u'success': False, u"step": 2, u'msg': u'{}'.format(error_message)})

            elif _type == 'valid':
                assert_equals(res, {u'success': True, u"step": 2, u'msg': u'step 2 data saved'})

        assert_equals(len(self._block.results), 3)

    def test_buzfeed_wizard_step3(self):
        assert_equals(len(self._block.results), 0)

        # add buzfeed quiz
        res = self.save_wizard_step1(self._block.BUZ_FEED_QUIZ_VALUE)
        assert_equals(res['success'], True)

        # add categories for buz-feed quiz
        res = self.save_buzfeed_step2()
        assert_equals(res['success'], True)

        # confirm if categories added
        assert_equals(len(self._block.results), 2)

        assert_equals(len(self._block.questions), 0)
        # test all related cases
        for _type, data in self._step3_buzzfeed_data.items():
            data = json.dumps(data)
            res = json.loads(self._block.handle('save_data', self.make_request(data)).body)

            if _type == 'missing_questions':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'at least one question required'})
            elif _type == 'missing_ques_id_case1':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 1 id required'})
            elif _type == 'missing_ques_id_case2':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 2 id required'})
            elif _type == 'missing_ques_txt_case1':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 1 text required'})
            elif _type == 'missing_ques_txt_case2':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 2 text required'})

            elif _type == 'missing_ques_choice_category_case1':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 1 having invalid choices.'
                                                                           u' category required'})
            elif _type == 'missing_ques_choice_category_case2':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 2 having invalid choices.'
                                                                           u' category required'})
            elif _type == 'invalid_ques_choice_category_case1':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 1 having invalid choices.'
                                                                           u' invalid category_id found'})
            elif _type == 'invalid_ques_choice_category_case2':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 2 having invalid choices.'
                                                                           u' invalid category_id found'})

            elif _type == 'missing_ques_choices_case1':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 1 having invalid choices.'
                                                                           u' choices list is missing'})
            elif _type == 'missing_ques_choices_case2':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 2 having invalid choices.'
                                                                           u' choices list is missing'})
            elif _type == 'missing_ques_choice_txt_case1':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 1 having invalid choices.'
                                                                           u' name required'})
            elif _type == 'missing_ques_choice_txt_case2':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 2 having invalid choices.'
                                                                           u' name required'})

            elif _type == 'valid':
                assert_equals(res, {u'success': True, u"step": 3, u'msg': u'step 3 data saved'})

        assert_equals(len(self._block.questions), 2)

    def test_diagnostic_wizard_step3(self):
        assert_equals(len(self._block.results), 0)

        # add buzfeed quiz
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
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'at least one question required'})
            elif _type == 'missing_ques_id_case1':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 1 id required'})
            elif _type == 'missing_ques_id_case2':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 2 id required'})
            elif _type == 'missing_ques_txt_case1':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 1 text required'})
            elif _type == 'missing_ques_txt_case2':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 2 text required'})

            elif _type == 'missing_ques_choices_case1':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 1 having invalid choices.'
                                                                           u' choices list is missing'})
            elif _type == 'missing_ques_choices_case2':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 2 having invalid choices.'
                                                                           u' choices list is missing'})
            elif _type == 'missing_ques_choice_txt_case1':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 1 having invalid choices.'
                                                                           u' name required'})
            elif _type == 'missing_ques_choice_txt_case2':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 2 having invalid choices.'
                                                                           u' name required'})
            elif _type == 'missing_ques_choice_value_case1':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 1 having invalid choices.'
                                                                           u' choice value required'})
            elif _type == 'missing_ques_choice_value_case2':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'question 2 having invalid choices.'
                                                                           u' choice value required'})

            elif _type == 'invalid_datatype_choice_value_case1':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'could not convert string to float: AA'})

            elif _type == 'invalid_datatype_choice_value_case2':
                assert_equals(res, {u'success': False, u"step": 3, u'msg': u'could not convert string to float: BB'})

            elif _type == 'valid':
                assert_equals(res, {u'success': True, u"step": 3, u'msg': u'step 3 data saved'})

        assert_equals(len(self._block.questions), 2)