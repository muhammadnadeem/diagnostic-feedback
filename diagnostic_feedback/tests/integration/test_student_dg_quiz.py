from .base_test import StudentBaseTest


class StudentDiagnosticStyleTest(StudentBaseTest):
    """
    Hold lms tests for Diagnostic-Style Quiz
    """
    def test_for_single_group_efficient_team(self):
        """
        Test a quiz by submitting questions in an order to produce result as "Efficient" team
        it will test single-group quiz
        """

        # load student view with required data (3 questions, Default Group)
        self.load_student_view('dg_quiz')

        # get wizard buttons to perform previous/next/start-over actions
        next_btn, back_btn, startover_link = self._get_action_buttons()

        # start-over button should be hidden as quiz loaded
        self.assertFalse(startover_link.is_displayed())

        # verify 1st question for all necessary checks, also select 1st choice for this question
        self._verify_question(question_order=0, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        # submit 1st question, it should load next question (question 2)
        self._submit_question()

        # verify 2nd question for all necessary checks, also select 1st choice for this question
        self._verify_question(question_order=1, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        # submit 2nd question, it should load next question (question 3)
        self._submit_question()

        # verify 3rd question for all necessary checks, also select 1st choice for this question
        self._verify_question(question_order=2, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        # submit 3rd question, it should load final result
        self._submit_question(wait_until_next_btn_disabled=False)

        self.wait_until_visible(startover_link)

        # get text from final result div
        final_result = self._get_final_result_text()

        self.assertIn('Efficient', final_result)

    def test_for_single_group_mediocre_team(self):
        """
        Test a quiz by submitting questions in an order to produce result as "Mediocre" team
        it will test single-group quiz
        """

        # load student view with required data (3 questions, Default Group)
        self.load_student_view('dg_quiz')

        # get wizard buttons to perform previous/next/start-over actions
        next_btn, back_btn, startover_link = self._get_action_buttons()

        # start-over button should be hidden as quiz loaded
        self.assertFalse(startover_link.is_displayed())

        # verify 1st question for all necessary checks, also select 1st choice for this question
        self._verify_question(question_order=0, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        # submit 1st question, it should load next question (question 2)
        self._submit_question()

        # verify 2nd question for all necessary checks, also select 2nd choice for this question
        self._verify_question(question_order=1, next_btn=next_btn, back_btn=back_btn, choice_idx=1)
        # submit 2nd question, it should load next question (question 3)
        self._submit_question()

        # verify 3rd question for all necessary checks, also select 1st choice for this question
        self._verify_question(question_order=2, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        # submit 3rd question, it should load final result
        self._submit_question(wait_until_next_btn_disabled=False)

        self.wait_until_visible(startover_link)

        # get text from final result div
        final_result = self._get_final_result_text()

        self.assertIn('Mediocre', final_result)

    def test_for_single_group_awful_team(self):
        """
        Test a quiz by submitting questions in an order to produce result as "Awful" team
        it will test single-group quiz
        """

        # load student view with required data (3 questions, Default Group)
        self.load_student_view('dg_quiz')

        # get wizard buttons to perform previous/next/start-over actions
        next_btn, back_btn, startover_link = self._get_action_buttons()

        # start-over button should be hidden as quiz loaded
        self.assertFalse(startover_link.is_displayed())

        # verify 1st question for all necessary checks, also select 3rd choice for this question
        self._verify_question(question_order=0, next_btn=next_btn, back_btn=back_btn, choice_idx=2)
        # submit 1st question, it should load next question (question 2)
        self._submit_question()

        # verify 2nd question for all necessary checks, also select 1st choice for this question
        self._verify_question(question_order=1, next_btn=next_btn, back_btn=back_btn, choice_idx=1)
        # submit 2nd question, it should load next question (question 3)
        self._submit_question()

        # verify 3rd question for all necessary checks, also select 3rd choice for this question
        self._verify_question(question_order=2, next_btn=next_btn, back_btn=back_btn, choice_idx=2)
        # submit 3rd question, it should load final result
        self._submit_question(wait_until_next_btn_disabled=False)

        self.wait_until_visible(startover_link)

        # get text from final result div
        final_result = self._get_final_result_text()

        self.assertIn('Awful', final_result)

    def test_for_multi_group(self):
        """
        Test a quiz by submitting questions in an order to produce result as "Efficient" and
        "Mediocre" teams, it will test multi-group quiz
        """

        # load student view with required data (6 questions for 2 groups)
        self.load_student_view('dg_multi_group_quiz')

        # get wizard buttons to perform previous/next/start-over actions
        next_btn, back_btn, startover_link = self._get_action_buttons()

        # start-over button should be hidden when the quiz is loaded
        self.assertFalse(startover_link.is_displayed())

        # verify 1st question for all necessary checks, also select 1st choice for this question
        self._verify_question(question_order=0, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        # submit 1st question, it should load next question (question 2)
        self._submit_question()

        # verify 2nd question for all necessary checks, also select 1st choice for this question
        self._verify_question(question_order=1, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        # submit 2nd question, it should load next question (question 3)
        self._submit_question()

        # verify 3rd question for all necessary checks, also select 1st choice for this question
        self._verify_question(question_order=2, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        # submit 3rd question, it should load next question (question 4)
        self._submit_question()

        # verify 4th question for all necessary checks, also select 1st choice for this question
        self._verify_question(question_order=3, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        # submit 4th question, it should load next question (question 5)
        self._submit_question()

        # verify 5th question for all necessary checks, also select 2nd choice for this question
        self._verify_question(question_order=4, next_btn=next_btn, back_btn=back_btn, choice_idx=1)
        # submit 5th question, it should load next question (question 6)
        self._submit_question()

        # verify 6th question for all necessary checks, also select 1st choice for this question
        self._verify_question(question_order=5, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        # submit 6th question, it should load final result
        self._submit_question(wait_until_next_btn_disabled=False)

        self.wait_until_visible(startover_link)

        # get node objects for all final result div elements
        final_results = self._get_final_results()

        self.assertIn('Efficient', final_results[0].text)
        self.assertIn('Mediocre', final_results[1].text)

    def test_startover(self):
        self.load_student_view('dg_quiz')

        # get wizard buttons to perform previous/next/start-over actions
        next_btn, back_btn, startover_link = self._get_action_buttons()

        # we also need back/next links along with buttons
        back_btn_link = self._get_previous_button_link()
        next_btn_link = self._get_next_button_link()

        self.assertFalse(startover_link.is_displayed())

        self._verify_question(question_order=0, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        self._submit_question()

        self._verify_question(question_order=1, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        self._submit_question()

        self._verify_question(question_order=2, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        self._submit_question(wait_until_next_btn_disabled=False)

        self.wait_until_visible(startover_link)

        self.assertFalse(back_btn_link.is_displayed())
        self.assertFalse(next_btn_link.is_displayed())
        self.assertTrue(startover_link.is_displayed())

        final_result = self._get_final_result_text()

        self.assertIn('Efficient', final_result)

        self._verify_startover(next_btn, back_btn, next_btn_link, back_btn_link, startover_link)

        final_result = self._get_final_result_text()

        self.assertIn('Awful', final_result)
