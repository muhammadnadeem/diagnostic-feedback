from .base_test import StudentBaseTest


class StudentBuzzFeedStyleTest(StudentBaseTest):

    def test_for_single_group_monarch(self):
        self.load_student_view('bf_quiz', {"mode": "standard"})

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

        self.assertEqual('Monarch' in final_result, True)

    def test_for_single_group_swallowtail(self):
        self.load_student_view('bf_quiz', {"mode": "standard"})

        next_btn = self._get_next_button()
        back_btn = self._get_previous_button()
        startover_link = self._get_startover_button_link()

        self.assertEqual(startover_link.is_displayed(), False)

        self._verify_question(0, next_btn, back_btn, 1)
        self._submit_question()

        self._verify_question(1, next_btn, back_btn, 1)
        self._submit_question()

        self._verify_question(2, next_btn, back_btn, 1)
        self._submit_question(is_last=True)

        self.wait_until_visible(startover_link)

        self.assertEqual(startover_link.is_displayed(), True)

        final_result = self.browser.find_element_by_css_selector('div.response_body').text

        self.assertEqual('Swallowtail' in final_result, True)

    def test_for_single_group_elfin(self):
        self.load_student_view('bf_quiz', {"mode": "standard"})

        next_btn = self._get_next_button()
        back_btn = self._get_previous_button()
        startover_link = self._get_startover_button_link()

        self.assertEqual(startover_link.is_displayed(), False)

        self._verify_question(0, next_btn, back_btn, 2)
        self._submit_question()

        self._verify_question(1, next_btn, back_btn, 2)
        self._submit_question()

        self._verify_question(2, next_btn, back_btn, 1)
        self._submit_question(is_last=True)

        self.wait_until_visible(startover_link)

        self.assertEqual(startover_link.is_displayed(), True)

        final_result = self.browser.find_element_by_css_selector('div.response_body').text

        self.assertEqual('Elfin' in final_result, True)

    def test_for_multi_group_quiz(self):
        self.load_student_view('bf_multi_group_quiz', {"mode": "standard"})

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

        self._verify_question(3, next_btn, back_btn, 1)
        self._submit_question()

        self._verify_question(4, next_btn, back_btn, 1)
        self._submit_question()

        self._verify_question(5, next_btn, back_btn, 1)
        self._submit_question(is_last=True)

        self.wait_until_visible(startover_link)

        self.assertEqual(startover_link.is_displayed(), True)

        final_results = self.browser.find_elements_by_css_selector('div.response_body div.result')

        self.assertEqual('Monarch' in final_results[0].text, True)
        self.assertEqual('Swallowtail' in final_results[1].text, True)
