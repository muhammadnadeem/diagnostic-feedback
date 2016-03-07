from selenium.webdriver.support.ui import WebDriverWait
from xblock.fields import String
from xblockutils.base_test import SeleniumXBlockTest
from xblockutils.resources import ResourceLoader
# Studio adds a url_name property to each XBlock but Workbench doesn't.
# Since we rely on it, we need to mock url_name support so it can be set via XML and
# accessed like a normal field.
from diagnostic_feedback.quiz import QuizBlock

QuizBlock.url_name = String()

loader = ResourceLoader(__name__)


class DiagnosticFeedbackBaseTest(SeleniumXBlockTest):
    """
    Base class for integration tests.
    Scenarios can be loaded and edited on the fly.
    """

    def _get_previous_button(self):
        """
        Get previous button node object
        """
        return self.browser.find_elements_by_xpath("//ul[@role='menu']/li")[0]

    def _get_previous_button_link(self):
        """
        Get previous link node object
        """
        return self.browser.find_element_by_xpath("//ul[@role='menu']/li/a[@href='#previous']")

    def _get_next_button(self):
        """
        Get next button node object
        """
        return self.browser.find_elements_by_xpath("//ul[@role='menu']/li")[1]

    def _get_next_button_link(self):
        """
        Get next link node object
        """
        return self.browser.find_element_by_xpath("//ul[@role='menu']/li/a[@href='#next']")

    def _get_action_buttons(self):
        """
        Get action buttons that must be required in all test cases
        """
        next_btn = self._get_next_button()
        back_btn = self._get_previous_button()
        startover_link = self._get_startover_button_link()

        return next_btn, back_btn, startover_link

    def assert_startover_hidden(self, startover_link):
        self.assertFalse(startover_link.is_displayed())

    def wait_until_has_class_disabled(self, elem):
        """ Wait until the given element has disabled class """

        wait = WebDriverWait(elem, self.timeout)
        wait.until(
            lambda e: 'disabled' in elem.get_attribute('class'),
            u"{} should be disabled".format(elem.text)
        )

    def _get_final_result_text(self):
        """
        Get text of final result div element
        """
        return self.browser.find_element_by_css_selector('div.response_body').text

    def _get_final_results(self):
        """
        Get node object of all final result div elements
        """
        return self.browser.find_elements_by_css_selector('div.response_body div.result')

    def load_scenario(self, xml_file, params=None, load_immediately=True, view='student_view'):
        """
        Given the name of an XML file in the xml_templates folder, load it into the workbench.
        """
        params = params or {}
        scenario = loader.render_template("xml_templates/{}".format(xml_file), params)
        self.set_scenario_xml(scenario)
        if load_immediately:
            return self.go_to_view(view)

    def load_student_view(self, xml_file, params=None):
        """
        Load student view in workbench
        """
        self.load_scenario("student_{}.xml".format(xml_file), params=params)

    def load_studio_view(self, xml_file, params=None):
        """
        Load studio view in workbench
        """
        self.load_scenario("studio_{}.xml".format(xml_file), params=params, view='studio_view')


class StudentBaseTest(DiagnosticFeedbackBaseTest):

    def _get_startover_button(self):
        """
        Get start-over button node object
        """
        return self.browser.find_elements_by_xpath("//ul[@role='menu']/li")[3]

    def _get_startover_button_link(self):
        """
        Get start-over link node object
        """
        return self.browser.find_element_by_xpath("//ul[@role='menu']/li/a[@href='#cancel']")

    def _get_visible_choices(self):
        """
        Return visible choices
        """
        return [c for c in self.browser.find_elements_by_xpath("//input[@type='radio']") if c.is_displayed()]

    def _is_any_choice_selected(self):
        """
        Check if any choice is selected from visible choices
        """
        return any(choice.is_selected() for choice in self._get_visible_choices())

    def _verify_back_button_status(self, back_btn, question_order):
        """
        Check if previous button is enabled for a question that has order > 0
        """
        if question_order > 0:
            # if question is not first in order, previous button should be enabled
            self.assertEqual(back_btn.get_attribute('class'), '')
        else:
            # if first question, previous button should be disabled
            self.assertEqual(back_btn.get_attribute('class'), 'disabled')

    def _verify_question(self, question_order=0, next_btn=None, back_btn=None, choice_idx=0):
        # confirm that not a single choice is selected from visible choices as a question is initially loaded
        self.assertFalse(self._is_any_choice_selected())

        # check if previous button is properly enabled/disabled for any question, before a choice selection
        self._verify_back_button_status(back_btn, question_order)

        # next button should be disabled until a choice is selected
        self.assertEqual(next_btn.get_attribute('class'), 'disabled')

        # get a given choice and click to select
        choice = self._get_visible_choices()[choice_idx]
        choice.click()
        # confirm if choice is marked as selected
        self.assertTrue(self._is_any_choice_selected())

        # check if previous button is properly enabled/disabled for any question, after a choice selection
        self._verify_back_button_status(back_btn, question_order)

        # check if next button is enabled after any choice selection
        self.assertEqual(next_btn.get_attribute('class'), '')

    def _verify_startover(self, next_btn, back_btn, next_btn_link, back_btn_link, startover_link):
        """
        Method to verify start-over functionality
        """

        # click start-over link, it will load first question of quiz
        startover_link.click()
        # wait until hidden next button is shown
        self.wait_until_visible(next_btn)
        # check if start-over button is hidden properly
        self.assertFalse(startover_link.is_displayed())
        # check if next/previous buttons have 'disabled' class after shown
        self.wait_until_has_class_disabled(next_btn)
        self.assertEqual(back_btn.get_attribute('class'), 'disabled')

        # verify 1st question for all necessary checks, also select 1st choice for this question
        self._verify_question(question_order=0, next_btn=next_btn, back_btn=back_btn, choice_idx=0)
        # submit 1st question, it should load next question (question 2)
        self._submit_question()

        # verify 2nd question for all necessary checks, also select 2nd choice for this question
        self._verify_question(question_order=1, next_btn=next_btn, back_btn=back_btn, choice_idx=1)
        # submit 2nd question, it should load next question (question 3)
        self._submit_question()

        # move back to 2nd question from 3rd question without doing any action
        self._get_previous_button_link().click()

        # check if both next/previous button at 2nd question are enabled as a choice was already selected at time of
        # question submission
        self.assertEqual(back_btn.get_attribute('class'), '')
        self.assertEqual(next_btn.get_attribute('class'), '')

        # move back to 1st question from 2nd question without doing any action
        self._get_previous_button_link().click()

        # check if previous button at 1st question is disabled and next button is enabled as choice was already
        # selected at time of question submission
        self.assertEqual(back_btn.get_attribute('class'), 'disabled')
        self.assertEqual(next_btn.get_attribute('class'), '')

        # submit the 1st question with same previously selected choice, 2nd question should be loaded, do not wait for
        # next button disable
        self._submit_question(wait_until_next_btn_disabled=False)

        # check if both next/previous button at 2nd question are enabled as a choice was already selected at time of
        # question submission
        self.assertEqual(back_btn.get_attribute('class'), '')
        self.assertEqual(next_btn.get_attribute('class'), '')

        # submit the 2nd question with same previously selected choice, 3rd question should be loaded, wait until
        # next button is disabled
        self._submit_question()

        # check if previous button is enabled
        self.assertEqual(back_btn.get_attribute('class'), '')

        # verify 3rd (last) question for all necessary checks, also select 3rd choice for this question
        self._verify_question(question_order=2, next_btn=next_btn, back_btn=back_btn, choice_idx=2)
        # submit 3rd (last) question, it should load result, hide the next/previous buttons and show start-over link
        # again, do not wait for next button disable
        self._submit_question(wait_until_next_btn_disabled=False)

        # check if start-over button is shown again
        self.wait_until_visible(startover_link)

        # check if next/previous button are hidden
        self.assertFalse(back_btn_link.is_displayed())
        self.assertFalse(next_btn_link.is_displayed())

    def _submit_question(self, wait_until_next_btn_disabled=True):
        """
        Submit a question by clicking next button link
        """
        # wait until next button is visible
        self.wait_until_visible(self._get_next_button())
        # submit question by clicking next link
        self._get_next_button_link().click()
        if wait_until_next_btn_disabled:
            self.wait_until_has_class_disabled(self._get_next_button())
