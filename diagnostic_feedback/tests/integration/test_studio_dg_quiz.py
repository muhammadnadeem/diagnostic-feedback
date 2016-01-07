from .base_test import StudioBaseTest


class StudentDiagnosticStyleTest(StudioBaseTest):

    def test_display_submit_false_does_not_display_submit(self):
        self.load_studio_view('create_quiz', {"mode": "standard"})

        wizard = self.browser.find_element_by_css_selector("div.edit_questionnaire_panel")

        # self.wait_until_visible(wizard)
        #
        # self._get_next_button_link().click()
        #
        # title_error = bool(self.browser.find_element_by_xpath("//input[contains(@id,'_title')]/following-sibling::div"
        #                                                       "[contains(@class, 'custom-tooltip')]"))
        # self.assertEqual(title_error, True)
        #
        # type_error = bool(self.browser.find_element_by_xpath("//select[contains(@id,'_type')]/following-sibling::div"
        #                                                      "[contains(@class, 'custom-tooltip')]"))
        # self.assertEqual(type_error, True)
        #
        # description_error = bool(self.browser.find_element_by_xpath("//textarea[contains(@id,'_description')]/"
        #                                                             "preceding-sibling::div[contains(@class, "
        #                                                             "'custom-tooltip')]"))
        # self.assertEqual(description_error, True)
        #
        # title, type, description = self.get_step1_fields()
        #
        # title.send_keys('Test Diagnostic Style Quiz')
        # type.send_keys('DG')
        # description.send_keys('Description for test diagnostic style quiz')
        #
        # self._get_next_button_link().click()

        pass
