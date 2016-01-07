from .base_test import StudentBaseTest


class StudentDiagnosticStyleTest(StudentBaseTest):

    def test_for_single_grp_efficient_team(self):
        self.load_student_view('dg_quiz', {"mode": "standard"})

        next_btn = self._get_next_button()
        back_btn = self._get_previous_button()
        startover_link = self._get_startover_button_link()

        self.assertEqual(startover_link.is_displayed(), False)

        self._verify_question(0, next_btn, back_btn, 0)
        self._submit_question()

        self._verify_question(1, next_btn, back_btn, 0)
        self._submit_question()

        self._verify_question(2, next_btn, back_btn, 0)
        self._submit_question(is_last=True)

        self.wait_until_visible(startover_link)

        self.assertEqual(startover_link.is_displayed(), True)

        final_result = self.browser.find_element_by_css_selector('div.response_body').text

        self.assertEqual('Efficient' in final_result, True)

    def test_for_single_grp_mediocre_team(self):
        self.load_student_view('dg_quiz', {"mode": "standard"})

        next_btn = self._get_next_button()
        back_btn = self._get_previous_button()
        startover_link = self._get_startover_button_link()

        self.assertEqual(startover_link.is_displayed(), False)

        self._verify_question(0, next_btn, back_btn, 0)
        self._submit_question()

        self._verify_question(1, next_btn, back_btn, 1)
        self._submit_question()

        self._verify_question(2, next_btn, back_btn, 0)
        self._submit_question(is_last=True)

        self.wait_until_visible(startover_link)

        self.assertEqual(startover_link.is_displayed(), True)

        final_result = self.browser.find_element_by_css_selector('div.response_body').text

        self.assertEqual('Mediocre' in final_result, True)

    def test_for_single_grp_awful_team(self):
        self.load_student_view('dg_quiz', {"mode": "standard"})

        next_btn = self._get_next_button()
        back_btn = self._get_previous_button()
        startover_link = self._get_startover_button_link()

        self.assertEqual(startover_link.is_displayed(), False)

        self._verify_question(0, next_btn, back_btn, 2)
        self._submit_question()

        self._verify_question(1, next_btn, back_btn, 1)
        self._submit_question()

        self._verify_question(2, next_btn, back_btn, 2)
        self._submit_question(is_last=True)

        self.wait_until_visible(startover_link)

        self.assertEqual(startover_link.is_displayed(), True)

        final_result = self.browser.find_element_by_css_selector('div.response_body').text

        self.assertEqual('Awful' in final_result, True)

    def test_for_multi_group(self):
        self.load_student_view('dg_multi_group_quiz', {"mode": "standard"})

        next_btn = self._get_next_button()
        back_btn = self._get_previous_button()
        startover_link = self._get_startover_button_link()

        self.assertEqual(startover_link.is_displayed(), False)

        self._verify_question(0, next_btn, back_btn, 0)
        self._submit_question()

        self._verify_question(1, next_btn, back_btn, 0)
        self._submit_question()

        self._verify_question(2, next_btn, back_btn, 0)
        self._submit_question()

        self._verify_question(3, next_btn, back_btn, 0)
        self._submit_question()

        self._verify_question(4, next_btn, back_btn, 1)
        self._submit_question()

        self._verify_question(5, next_btn, back_btn, 0)
        self._submit_question(is_last=True)

        self.wait_until_visible(startover_link)

        self.assertEqual(startover_link.is_displayed(), True)

        final_results = self.browser.find_elements_by_css_selector('div.response_body div.result')

        self.assertEqual('Efficient' in final_results[0].text, True)
        self.assertEqual('Mediocre' in final_results[1].text, True)

    # def test_startover(self):
    #     self.load_student_view('dg_quiz', {"mode": "standard"})
    #
    #     next_btn = self._get_next_button()
    #     back_btn_link =  self._get_previous_button_link()
    #     back_btn = self._get_previous_button()
    #     next_btn_link = self._get_next_button_link()
    #     startover_link = self._get_startover_button_link()
    #
    #     self.assertEqual(startover_link.is_displayed(), False)
    #
    #     self._verify_question(0, next_btn, back_btn, 0)
    #     self._submit_question()
    #
    #     self._verify_question(1, next_btn, back_btn, 0)
    #     self._submit_question()
    #
    #     self._verify_question(2, next_btn, back_btn, 0)
    #     self._submit_question(is_last=True)
    #
    #     self.wait_until_visible(startover_link)
    #
    #     self.assertEqual(back_btn_link.is_displayed(), False)
    #     self.assertEqual(next_btn_link.is_displayed(), False)
    #     self.assertEqual(startover_link.is_displayed(), True)
    #
    #     final_result = self.browser.find_element_by_css_selector('div.response_body').text
    #
    #     self.assertEqual('Efficient' in final_result, True)
    #
    #     self._verify_startover(next_btn, back_btn, next_btn_link, back_btn_link, startover_link)
    #
    #     final_result = self.browser.find_element_by_css_selector('div.response_body').text
    #
    #     self.assertEqual('Awful' in final_result, True)
