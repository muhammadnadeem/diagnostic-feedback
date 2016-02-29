from selenium.webdriver.support.ui import WebDriverWait
from xblock.fields import String
from xblockutils.base_test import SeleniumXBlockTest
from xblockutils.resources import ResourceLoader
import time
# Studio adds a url_name property to each XBlock but Workbench doesn't.
# Since we rely on it, we need to mock url_name support so it can be set via XML and
# accessed like a normal field.
from diagnostic_feedback.quiz import QuizBlock
QuizBlock.url_name = String()

loader = ResourceLoader(__name__)


class DiagnosticFeedbackBaseTest(SeleniumXBlockTest):
    """
    The new base class for integration tests.
    Scenarios can be loaded and edited on the fly.
    """
    default_css_selector = 'div.diagnostic-feedback'

    def _get_previous_button(self):
        return self.browser.find_elements_by_xpath("//ul[@role='menu']/li")[0]

    def _get_previous_button_link(self):
        return self.browser.find_element_by_xpath("//ul[@role='menu']/li/a[@href='#previous']")

    def _get_next_button(self):
        return self.browser.find_elements_by_xpath("//ul[@role='menu']/li")[1]

    def _get_next_button_link(self):
        return self.browser.find_element_by_xpath("//ul[@role='menu']/li/a[@href='#next']")

    def wait_until_disabled(self, elem):
        """ Wait until the given element is disabled """

        wait = WebDriverWait(elem, self.timeout)
        wait.until(lambda e: elem.get_attribute('class') == 'disabled',
                   u"{} should be disabled".format(elem.text))

    def wait_until_enabled(self, elem):
        """ Wait until the given element is enabled """

        wait = WebDriverWait(elem, self.timeout)
        wait.until(lambda e: elem.get_attribute('class') == '',
                   u"{} should be enabled".format(elem.text))

    def load_scenario(self, xml_file, params=None, load_immediately=True):
        """
        Given the name of an XML file in the xml_templates folder, load it into the workbench.
        """
        params = params or {}
        scenario = loader.render_template("xml_templates/{}".format(xml_file), params)
        self.set_scenario_xml(scenario)
        if load_immediately:
            return self.go_to_view("student_view")

    def load_student_view(self, xml_file, params=None, load_immediately=True):
        """
        Load student view in workbench
        """
        params = params or {}
        scenario = loader.render_template("xml_templates/student_{}.xml".format(xml_file), params)
        self.set_scenario_xml(scenario)
        if load_immediately:
            return self.go_to_view("student_view")

    def load_studio_view(self, xml_file, params=None):
        """
        Load studio view in workbench
        """
        params = params or {}
        scenario = loader.render_template("xml_templates/studio_{}.xml".format(xml_file), params)
        self.set_scenario_xml(scenario)
        return self.go_to_view("studio_view")


class StudentBaseTest(DiagnosticFeedbackBaseTest):

    def _get_startover_button(self):
        return self.browser.find_elements_by_xpath("//ul[@role='menu']/li")[3]

    def _get_startover_button_link(self):
        return self.browser.find_element_by_xpath("//ul[@role='menu']/li/a[@href='#cancel']")

    def _is_any_choice_selected(self):
        selected = False
        choices = [c for c in self.browser.find_elements_by_xpath("//input[@type='radio']") if c.is_displayed()]

        for choice in choices:
            if choice.is_selected():
                selected = True
                break

        return selected

    def _get_choice(self, idx):
        return [c for c in self.browser.find_elements_by_xpath("//input[@type='radio']") if c.is_displayed()][idx]

    def _verify_question(self, question_order, next_btn, back_btn, choice_idx):

        self.assertEqual(self._is_any_choice_selected(), False)

        if question_order > 0:
            self.assertEqual(back_btn.get_attribute('class'), '')
        else:
            self.assertEqual(back_btn.get_attribute('class'), 'disabled')

        self.assertEqual(next_btn.get_attribute('class'), 'disabled')

        choice = self._get_choice(choice_idx)
        choice.click()
        self.assertEqual(self._is_any_choice_selected(), True)

        if question_order == 0:
            self.assertEqual(back_btn.get_attribute('class'), 'disabled')
        else:
            self.assertEqual(back_btn.get_attribute('class'), '')

        self.assertEqual(next_btn.get_attribute('class'), '')

    def _verify_startover(self, next_btn, back_btn, next_btn_link, back_btn_link, startover_link):
        startover_link.click()

        time.sleep(50)
        self.wait_until_visible(next_btn)
        self.assertEqual(startover_link.is_displayed(), False)

        self.assertEqual(startover_link.is_displayed(), False)
        self.assertEqual(back_btn.get_attribute('class'), 'disabled')
        self.assertEqual(next_btn.get_attribute('class'), 'disabled')

        self._verify_question(0, next_btn, back_btn, 0)
        self._submit_question()

        self._verify_question(1, next_btn, back_btn, 1)
        self._submit_question()

        self._get_previous_button_link().click()

        self.assertEqual(back_btn.get_attribute('class'), '')
        self.assertEqual(next_btn.get_attribute('class'), '')

        self._get_previous_button_link().click()

        self.assertEqual(back_btn.get_attribute('class'), 'disabled')
        self.assertEqual(next_btn.get_attribute('class'), '')

        self._submit_question(is_last=True)

        self.assertEqual(back_btn.get_attribute('class'), '')
        self.assertEqual(next_btn.get_attribute('class'), '')

        self._submit_question(is_last=True)

        self.assertEqual(back_btn.get_attribute('class'), '')
        self.assertEqual(next_btn.get_attribute('class'), 'disabled')

        self._verify_question(2, next_btn, back_btn, 2)
        self._submit_question(is_last=True)

        self.wait_until_visible(startover_link)

        self.assertEqual(back_btn_link.is_displayed(), False)
        self.assertEqual(next_btn_link.is_displayed(), False)
        self.assertEqual(startover_link.is_displayed(), True)

    def _submit_question(self, is_last=False):
        self.wait_until_visible(self._get_next_button())
        self._get_next_button_link().click()
        if not is_last:
            self.wait_until_disabled(self._get_next_button())


class StudioBaseTest(DiagnosticFeedbackBaseTest):

    def get_step1_fields(self):
        title = self.browser.find_element_by_css_selector("input[id*='_title']")

        type = self.browser.find_element_by_css_selector("select[id*='_type']")
        description = self.browser.find_element_by_css_selector("textarea[id*='_description']")

        return title, type, description
