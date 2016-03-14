from .base_test import StudentBaseTest


class StudentBuzzFeedStyleTest(StudentBaseTest):
    """
    Hold lms tests for BuzzFeed-Style Quiz
    """
    def test_for_single_group_monarch(self):
        """
        Test a quiz by submitting questions in an order to produce result as "Monarch"
        it will test single-group quiz
        """

        # load student view with required data (3 questions, Default Group)
        self.load_student_view('bf_quiz')

        # get wizard buttons to perform previous/next/start-over actions
        next_btn, back_btn, startover_link = self._get_action_buttons()

        # start-over button should be hidden as quiz loaded
        self.assert_startover_hidden(startover_link)

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

        self.assertIn('Monarch', final_result)

    def test_for_single_group_swallowtail(self):
        """
        Test a quiz by submitting questions in an order to produce result as "Swallowtail"
        it will test single-group quiz
        """

        # load student view with required data (3 questions, Default Group)
        self.load_student_view('bf_quiz')

        # get wizard buttons to perform previous/next/start-over actions
        next_btn, back_btn, startover_link = self._get_action_buttons()

        # start-over button should be hidden as quiz loaded
        self.assert_startover_hidden(startover_link)

        # verify 1st question for all necessary checks, also select 2nd choice for this question
        self._verify_question(question_order=0, next_btn=next_btn, back_btn=back_btn, choice_idx=1)
        # submit 1st question, it should load next question (question 2)
        self._submit_question()

        # verify 2nd question for all necessary checks, also select 2nd choice for this question
        self._verify_question(question_order=1, next_btn=next_btn, back_btn=back_btn, choice_idx=1)
        # submit 2nd question, it should load next question (question 3)
        self._submit_question()

        # verify 3rd question for all necessary checks, also select 2nd choice for this question
        self._verify_question(question_order=2, next_btn=next_btn, back_btn=back_btn, choice_idx=1)
        # submit 3rd question, it should load final result
        self._submit_question(wait_until_next_btn_disabled=False)

        self.wait_until_visible(startover_link)

        # get text from final result div
        final_result = self._get_final_result_text()

        self.assertIn('Swallowtail', final_result)

    def test_for_single_group_elfin(self):
        """
        Test a quiz by submitting questions in an order to produce result as "Elfin"
        it will test single-group quiz
        """

        # load student view with required data (3 questions, Default Group)
        self.load_student_view('bf_quiz')

        # get wizard buttons to perform previous/next/start-over actions
        next_btn, back_btn, startover_link = self._get_action_buttons()

        # start-over button should be hidden when the quiz is loaded
        self.assert_startover_hidden(startover_link)

        # verify 1st question for all necessary checks, also select 3rd choice for this question
        self._verify_question(question_order=0, next_btn=next_btn, back_btn=back_btn, choice_idx=2)
        # submit 1st question, it should load next question (question 2)
        self._submit_question()

        # verify 2nd question for all necessary checks, also select 3rd choice for this question
        self._verify_question(question_order=1, next_btn=next_btn, back_btn=back_btn, choice_idx=2)
        # submit 2nd question, it should load next question (question 3)
        self._submit_question()

        # verify 3rd question for all necessary checks, also select 2nd choice for this question
        self._verify_question(question_order=2, next_btn=next_btn, back_btn=back_btn, choice_idx=1)
        # submit 3rd question, it should load final result
        self._submit_question(wait_until_next_btn_disabled=False)

        self.wait_until_visible(startover_link)

        # get text from final result div
        final_result = self._get_final_result_text()

        self.assertIn('Elfin', final_result)

    def test_for_multi_group_quiz(self):
        """
        Test a quiz by submitting questions in an order to produce result as "Monarch" and "Swallowtail"
        it will test multi-group quiz
        """

        # load student view with required data (6 questions for 2 groups)
        self.load_student_view('bf_multi_group_quiz')

        # get wizard buttons to perform previous/next/start-over actions
        next_btn, back_btn, startover_link = self._get_action_buttons()

        # start-over button should be hidden when the quiz is loaded
        self.assert_startover_hidden(startover_link)

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

        # verify 4th question for all necessary checks, also select 2nd choice for this question
        self._verify_question(question_order=3, next_btn=next_btn, back_btn=back_btn, choice_idx=1)
        # submit 4th question, it should load next question (question 5)
        self._submit_question()

        # verify 5th question for all necessary checks, also select 2nd choice for this question
        self._verify_question(question_order=4, next_btn=next_btn, back_btn=back_btn, choice_idx=1)
        # submit 5th question, it should load next question (question 6)
        self._submit_question()

        # verify 6th question for all necessary checks, also select 2nd choice for this question
        self._verify_question(question_order=5, next_btn=next_btn, back_btn=back_btn, choice_idx=1)
        # submit 6th question, it should load final result
        self._submit_question(wait_until_next_btn_disabled=False)

        self.wait_until_visible(startover_link)

        # get node objects for all final result div elements
        final_results = self._get_final_results()

        self.assertIn('Monarch', final_results[0].text)
        self.assertIn('Swallowtail', final_results[1].text)
