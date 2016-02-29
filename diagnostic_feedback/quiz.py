import logging
import json
import copy
from xblock.core import XBlock
from xblock.fields import Scope, String, List, Integer, Dict, Boolean, Float
from xblock.fragment import Fragment
from xblockutils.resources import ResourceLoader
from .mixins import ResourceMixin, XBlockWithTranslationServiceMixin
from .quiz_result import QuizResultMixin
from .helpers import MainHelper
from .validators import Validator
from .sub_api import my_api
from .data_tool import ExportDataBlock
from datetime import datetime

log = logging.getLogger(__name__)
loader = ResourceLoader(__name__)


# Make '_' a no-op so we can scrape strings
def _(text):
    return text


@XBlock.needs('i18n')
@XBlock.wants('user')
class QuizBlock(ResourceMixin, QuizResultMixin, ExportDataBlock, XBlockWithTranslationServiceMixin):
    """
    An XBlock which can be used to add diagnostic quiz
    """
    BUZZFEED_QUIZ_VALUE = "BFQ"
    BUZZFEED_QUIZ_LABEL = _("BuzzFeed-style")
    DIAGNOSTIC_QUIZ_VALUE = "DG"
    DIAGNOSTIC_QUIZ_LABEL = _("Diagnostic-style")
    DEFAULT_GROUP = _('Default Group')

    display_name = String(
        display_name=_("Diagnostic Feedback"),
        help=_("This name appears in the horizontal navigation at the top of the page."),
        scope=Scope.settings,
        default=""
    )

    title = String(
        default='',
        scope=Scope.content,
        help=_("Title of quiz")
    )

    description = String(
        default="",
        scope=Scope.content,
        help=_("Description of quiz")
    )

    questions = List(
        default=[],
        help=_("This will hold list of question with respective choices"),
        scope=Scope.content,
    )

    student_choices = Dict(
        default={},
        help=_("This will hold user provided answers of questions"),
        scope=Scope.user_state,
    )

    quiz_type = String(
        default="",
        scope=Scope.content,
        help=_("Type of quiz")
    )

    results = List(
        default=[],
        scope=Scope.content,
        help=_("List of results")
    )

    student_result = String(
        default='',
        scope=Scope.user_state,
        help=_("Calculated feedback of each user")
    )

    types = List(
        default=[
            {"value": BUZZFEED_QUIZ_VALUE, "label": BUZZFEED_QUIZ_LABEL},
            {"value": DIAGNOSTIC_QUIZ_VALUE, "label": DIAGNOSTIC_QUIZ_LABEL},
        ],
        scope=Scope.content,
        help=_("List of results")
    )

    groups = List(
        default=[DEFAULT_GROUP],
        scope=Scope.content,
        help=_("List of results")
    )

    current_step = Integer(
        default=0,
        scope=Scope.user_state,
        help=_("To control which question should be shown to student")
    )

    weight = Float(
        display_name=_("Weight"),
        help=_("Defines the maximum total grade of this question."),
        default=1,
        scope=Scope.content,
        enforce_type=True
    )

    completed = Boolean(
        default=False,
        scope=Scope.user_state,
        help=_("Has the student completed this quiz")
    )

    @property
    def display_name_with_default(self):
        return self.title

    @property
    def additional_publish_event_data(self):
        return {
            'user_id': self.scope_ids.user_id,
            'block_id': self.get_block_id(),
            'component_id': self.scope_ids.usage_id
        }

    has_score = True

    def get_fragment(self, context, view='studio', json_args=None):
        """
        return fragment after loading css/js/html either for studio OR student view
        :param context: context for templates
        :param view: view_type i;e studio/student
        :return: fragment after loading all assets
        """
        """
            Return fragment after adding required css/js/html
        """
        fragment = Fragment()
        self.add_templates(fragment, context, view)
        self.add_css(fragment, view)
        self.add_js(fragment, view)
        self.initialize_js_classes(fragment, view, json_args)
        return fragment

    def append_choice(self, questions):
        """
        append student choice with each question if available
        :param questions: list of questions
        :return:
        """
        """

        """
        for question in questions:
            if self.quiz_type == self.DIAGNOSTIC_QUIZ_VALUE:
                question['student_choice'] = float(self.student_choices.get(question['id'])) if \
                    self.student_choices.get(question['id']) else ''
            else:
                question['student_choice'] = self.student_choices.get(question['id'], '')

    def get_block_id(self):
        """
        Return ID of `block`
        """
        usage_id = self.scope_ids.usage_id
        # Try accessing block ID. If usage_id does not have it, return usage_id itself
        return unicode(getattr(usage_id, 'block_id', usage_id))

    def get_question(self, question_id):
        """
        Return Question object for given question id
        """
        question = {}
        for question in self.questions:
            if question['id'] == question_id:
                question = question
                break

        return question

    def get_buzzfeed_answer(self, choices, student_choice):
        """
        Return buzzfeed quiz answer label from question choices using student choice
        """
        choice_name = ''
        for choice in choices:
            if choice['category_id'] == student_choice:
                choice_name = choice['name']
                break

        return choice_name

    def get_diagnostic_answer(self, choices, student_choice):
        """
        Return diagnostic quiz answer label from question choices using student choice
        """
        choice_name = ''
        for choice in choices:
            if str(choice['value']) == student_choice:
                choice_name = choice['name']
                break

        return choice_name

    def student_view(self, context=None):
        """
        it will loads student view
        :param context: context
        :return: fragment
        """

        context = {
            'questions': copy.deepcopy(self.questions),
            'self': self,
            'block_id': "xblock-{}".format(self.get_block_id()),
            'user_is_staff': self.user_is_staff()
        }

        if self.student_choices:
            self.append_choice(context['questions'])

        # return final result to show if user already completed the quiz
        if self.questions and self.current_step:
            if len(self.questions) == self.current_step:
                context['result'] = self.get_result()

        return self.get_fragment(
            context,
            'student',
            {
                'quiz_type': self.quiz_type,
                'quiz_title': self.title
            }
        )

    def get_attached_groups(self):
        # return already attached groups
        groups = []
        for r in self.results:
            if r['group'] not in groups:
                groups.append(r['group'])

        return groups

    def studio_view(self, context):
        """
        it will loads studio view
        :param context: context
        :return: fragment
        """
        block_id = "xblock-{}".format(self.get_block_id())
        course_key = getattr(self.scope_ids.usage_id, 'course_key', None)

        context['self'] = self
        context['block_id'] = block_id

        try:
            from xmodule.contentstore.content import StaticContent
            base_asset_url = StaticContent.get_base_url_path_for_course_assets(course_key)
        except:
            base_asset_url = ''

        return self.get_fragment(
            context,
            'studio',
            {
                'base_asset_url': base_asset_url,
                'quiz_type': self.quiz_type,
                'block_id': block_id,
                'results': self.results,
                'BUZZFEED_QUIZ_VALUE': self.BUZZFEED_QUIZ_VALUE,
                'DIAGNOSTIC_QUIZ_VALUE': self.DIAGNOSTIC_QUIZ_VALUE,
                'DEFAULT_GROUP': self.DEFAULT_GROUP,
                'questions': self.questions,
                'groups': self.groups,
                'attachedGroups': self.get_attached_groups(),
                'categoryTpl': loader.load_unicode('templates/underscore/category.html'),
                'rangeTpl': loader.load_unicode('templates/underscore/range.html'),
                'questionTpl': loader.load_unicode('templates/underscore/question.html'),
                'choiceTpl': loader.load_unicode('templates/underscore/choice.html')
            }
        )

    @XBlock.json_handler
    def save_data(self, data, suffix=''):
        """
        ajax handler to save data after applying required validation & filtration
        :param data: step data to save
        :param suffix:
        :return: response dict
        """

        success = True
        response_message = ""
        step = data.get('step', '')

        if not step:
            success = False
            response_message = self._('missing step number')
        else:
            try:
                is_valid_data, response_message = Validator.validate(self, data)
                if is_valid_data:
                    response_message = MainHelper.save_filtered_data(self, data)
                else:
                    success = False

            except Exception as ex:
                success = False
                response_message += ex.message if ex.message else str(ex)

        return {'step': step, 'success': success, 'msg': response_message}

    @XBlock.json_handler
    def save_choice(self, data, suffix=''):
        """
        save student choice for a question after validations
        :param data: answer data
        :param suffix:
        :return: response dict
        """

        student_result = ""
        response_message = ""

        try:
            success, response_message = Validator.validate_student_answer(self, data)
            if success:
                question_id = data['question_id']

                # save student answer
                self.student_choices[question_id] = data['student_choice']
                if self.current_step < data['currentStep']:
                    self.current_step = data['currentStep']

                # calculate feedback result if user answering last question
                if data['isLast']:
                    student_result = self.get_result()

                    if not self.completed:
                        # Save the latest score and make quiz completed
                        self.runtime.publish(self, 'grade', {
                            'value': 1.0,
                            'max_value': 1.0
                        })
                        self.completed = True

                    if my_api:
                        log.info("have sub_api instance")
                        # Also send to the submissions API:
                        item_key = self.student_item_key
                        item_key['item_id'] = self.get_block_id()
                        submission_data = self.create_submission_data()
                        submission_data['final_result'] = student_result
                        my_api.create_submission(item_key, json.dumps(submission_data))

                response_message = self._("Your response is saved")
        except Exception as ex:
            success = False
            response_message += str(ex)
        return {'success': success, 'student_result': student_result, 'response_msg': response_message}

    @XBlock.json_handler
    def start_over_quiz(self, data, suffix=''):
        """
        reset student_choices, student_result, current_step for current user
        :param data: empty dict
        :param suffix:
        :return: response dict
        """

        success = True
        response_message = self._("student data cleared")

        self.student_choices = {}
        self.student_result = ""
        self.current_step = 0

        return {'success': success, 'msg': response_message}

    @XBlock.json_handler
    def add_group(self, data, suffix=''):
        """
        Add new group in self.groups list
        """

        success = True
        grp_name = data.get('name', '')
        if grp_name not in self.groups:
            msg = self._('Group added successfully.')
            self.groups.append(grp_name)

        else:
            msg = self._('Group already exist.')
            success = False

        return {'success': success, 'msg': msg, 'group_name': grp_name}

    @XBlock.json_handler
    def publish_event(self, data, suffix=''):
        """
        Publish data for analytics purposes
        """
        event_type = data.pop('event_type')
        data['time'] = datetime.now()

        self.runtime.publish(self, event_type, data)
        return {'result': 'ok'}

    def create_submission_data(self):
        """
        Return a complete submission data as quiz completed
        """
        submission = {}
        for question in self.questions:
            question_id = question['id']
            question_data = self.get_question(question_id)
            if self.quiz_type == self.BUZZFEED_QUIZ_VALUE:
                question_answer = self.get_buzzfeed_answer(question_data['choices'], self.student_choices[question_id])
            else:
                question_answer = self.get_diagnostic_answer(question_data['choices'],
                                                             self.student_choices[question_id])

            submission[question_id] = {
                'question_text': question['text'],
                'answer': question_answer
            }

        return submission
