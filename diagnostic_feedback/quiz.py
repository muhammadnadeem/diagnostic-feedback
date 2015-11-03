import logging
import copy

from xblock.core import XBlock
from xblock.fields import Scope, String, List, Integer, Dict
from xblock.fragment import Fragment
from xblockutils.resources import ResourceLoader

from .resource import ResourceMixin
from .quiz_result import QuizResultMixin

from .helpers import MainHelper
from .validators import Validator
from .sub_api import SubmittingXBlockMixin, sub_api
import json

log = logging.getLogger(__name__)
loader = ResourceLoader(__name__)


# Make '_' a no-op so we can scrape strings
def _(text):
    return text


@XBlock.wants('user')
class QuizBlock(XBlock, ResourceMixin, QuizResultMixin, SubmittingXBlockMixin):
    """

    """
    BUZ_FEED_QUIZ_VALUE = "BFQ"
    BUZ_FEED_QUIZ_LABEL = "Buzz Feed Quiz"
    DIAGNOSTIC_QUIZ_VALUE = "DG"
    DIAGNOSTIC_QUIZ_LABEL = "Diagnostic Quiz"



    display_name = String(
        display_name="Diagnostic Feedback",
        help="This name appears in the horizontal navigation at the top of the page.",
        scope=Scope.settings,
        default="Diagnostic Feedback"
    )

    title = String(
        default='',
        scope=Scope.content,
        help='Title of quiz'
    )

    description = String(
        default='',
        scope=Scope.content,
        help='Description of quiz'
    )

    questions = List(
        default=[],
        help="This will hold list of question with respective choices",
        scope=Scope.content,
    )

    student_choices = Dict(
        default={},
        help="This will hold user provided answers of questions",
        scope=Scope.user_state,
    )

    quiz_type = String(
        default='',
        scope=Scope.content,
        help='Type of quiz'
    )

    results = List(
        default=[],
        scope=Scope.content,
        help='List of results'
    )

    student_result = String(
        default='',
        scope=Scope.user_state,
        help='Calculated feedback of each user'
    )

    types = List(
        default=[
            {"value": BUZ_FEED_QUIZ_VALUE, "label": BUZ_FEED_QUIZ_LABEL},
            {"value": DIAGNOSTIC_QUIZ_VALUE, "label": DIAGNOSTIC_QUIZ_LABEL},
        ],
        scope=Scope.content,
        help='List of results'
    )

    current_step = Integer(
        default=0,
        scope=Scope.user_state,
        help='To control which question should be shown to student'
    )

    def get_fragment(self, context, view='studio'):
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
        self.initialize_js_classes(fragment, view)
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

    def student_view(self, context=None):
        """
        it will loads student view
        :param context: context
        :return: fragment
        """
        context = {
            'questions': copy.deepcopy(self.questions),
            'self': self,

        }

        if self.student_choices:
            self.append_choice(context['questions'])

        # return final result to show if user already completed the quiz
        if self.questions and self.current_step:
            if len(self.questions) == self.current_step:
                if self.quiz_type == self.BUZ_FEED_QUIZ_VALUE:
                    context['result'] = self.get_buzz_feed_result()
                else:
                    context['result'] = self.get_diagnostic_result()

        return self.get_fragment(context, 'student')

    def author_view(self, context):
        context = {
            'questions': copy.deepcopy(self.questions),
            'self': self,

        }

        if self.student_choices:
            self.append_choice(context['questions'])

        # return final result to show if user already completed the quiz
        if self.questions and self.current_step:
            if len(self.questions) == self.current_step:
                if self.quiz_type == self.BUZ_FEED_QUIZ_VALUE:
                    context['result'] = self.get_buzz_feed_result()
                else:
                    context['result'] = self.get_diagnostic_result()

        return self.get_fragment(context, 'student')

    def studio_view(self, context):
        """
        it will loads studio view
        :param context: context
        :return: fragment
        """
        context['self'] = self
        return self.get_fragment(context, 'studio')

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
            response_message = 'missing step number'
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
    def get_template(self, data, suffix=''):
        """
        ajax handler: return a template to load new html content dynamically
        :param data: empty dict
        :param suffix:
        :return: template html as unicode string
        """


        _type = data.get('type')
        if _type == 'category':
            template = 'templates/underscore/new_category.html'
        elif _type == 'range':
            template = 'templates/underscore/new_range.html'
        elif _type == 'question':
            template = 'templates/underscore/new_question.html'
        elif _type == 'choice':
            template = 'templates/underscore/new_choice.html'

        return {'success': True, 'template': loader.load_unicode(template)}

    # def submit(self, submission):
    #     """
    #     The parent block is handling a student submission, including a new answer for this
    #     block. Update accordingly.
    #     """
    #     self.student_input = submission[0]['value'].strip()
    #     self.save()
    #
    #     if sub_api:
    #         # Also send to the submissions API:
    #         item_key = self.student_item_key
    #         # Need to do this by our own ID, since an answer can be referred to multiple times.
    #         item_key['item_id'] = self.name
    #         sub_api.create_submission(item_key, self.student_input)
    #
    #     log.info(u'Answer submitted for`{}`: "{}"'.format(self.name, self.student_input))
    #     return self.get_results()

    @XBlock.json_handler
    def save_choice(self, data, suffix=''):
        """
        save student choice for a question after validations
        :param data: answer data
        :param suffix:
        :return: response dict
        """

        result = ""
        response_message = ""

        try:
            success, response_message = Validator.validate_student_answer(data)
            if success:
                # save student answer
                self.student_choices[data['question_id']] = data['student_choice']
                if self.current_step < data['currentStep']:
                    self.current_step = data['currentStep']

                if sub_api:
                    # Also send to the submissions API:
                    item_key = self.student_item_key
                    item_key['item_id'] = data['question_id']
                    sub_api.create_submission(item_key, self.student_choices[data['question_id']])

                # calculate feedback result if user answering last question
                if data['isLast']:
                    if self.quiz_type == self.BUZ_FEED_QUIZ_VALUE:
                        success = True
                        result = self.get_buzz_feed_result()
                    else:
                        success = True
                        result = self.get_diagnostic_result()

                response_message = "Your response is saved"
        except Exception as ex:
            success = False
            response_message += str(ex)
        return {'success': success, 'student_result': result, 'msg': response_message}

    @XBlock.json_handler
    def start_over_quiz(self, data, suffix=''):
        """
        reset student_choices, student_result, current_step for current user
        :param data: empty dict
        :param suffix:
        :return: response dict
        """

        success = True
        response_message = "student data cleared"

        self.student_choices = {}
        self.student_result = ""
        self.current_step = 0

        return {'success': success, 'msg': response_message}

    def _delete_export(self):
        self.last_export_result = None
        self.display_data = None
        self.active_export_task_id = ''

    def _save_result(self, task_result):
        """ Given an AsyncResult or EagerResult, save it. """
        import pudb; pu.db
        self.active_export_task_id = ''
        if task_result.successful():
            if isinstance(task_result.result, dict) and not task_result.result.get('error'):
                self.display_data = task_result.result['display_data']
                del task_result.result['display_data']
                self.last_export_result = task_result.result
            else:
                self.last_export_result = {'error': u'Unexpected result: {}'.format(repr(task_result.result))}
                self.display_data = None
        else:
            self.last_export_result = {'error': unicode(task_result.result)}
            self.display_data = None

    @property
    def download_url_for_last_report(self):
        """ Get the URL for the last report, if any """
        # Unfortunately this is a bit inefficient due to the ReportStore API
        if not self.last_export_result or self.last_export_result['error'] is not None:
            return None
        from lms.djangoapps.instructor_task.models import ReportStore
        report_store = ReportStore.from_config(config_name='GRADES_DOWNLOAD')
        course_key = getattr(self.scope_ids.usage_id, 'course_key', None)
        return dict(report_store.links_for(course_key)).get(self.last_export_result['report_filename'])

    def _get_status(self):
        self.check_pending_export()
        return {
            'export_pending': bool(self.active_export_task_id),
            'last_export_result': self.last_export_result,
            'download_url': self.download_url_for_last_report,
        }

    def check_pending_export(self):
        """
        If we're waiting for an export, see if it has finished, and if so, get the result.
        """
        from .tasks import export_data as export_data_task  # Import here since this is edX LMS specific
        if self.active_export_task_id:
            async_result = export_data_task.AsyncResult(self.active_export_task_id)
            if async_result.ready():
                self._save_result(async_result)

    @XBlock.json_handler
    def start_export(self, data, suffix=''):
        """ Start a new asynchronous export """
        block_type = "QuizBlock"

        root_block_id = self.scope_ids.usage_id
        root_block_id = unicode(getattr(root_block_id, 'block_id', root_block_id))
        #
        if not self.user_is_staff():
            return {'error': 'permission denied'}

        # Launch task
        from .tasks import export_data as export_data_task
        self._delete_export()
        # Make sure we nail down our state before sending off an asynchronous task.
        self.save()
        async_result = export_data_task.delay(
            # course_id not available in workbench.
            unicode(getattr(self.runtime, 'course_id', 'course_id')),
            root_block_id,
            block_type
        )
        if async_result.ready():
            # In development mode, the task may have executed synchronously.
            # Store the result now, because we won't be able to retrieve it later :-/
            if async_result.successful():
                # Make sure the result can be represented as JSON, since the non-eager celery
                # requires that
                json.dumps(async_result.result)
            self._save_result(async_result)
        else:
            # The task is running asynchronously. Store the result ID so we can query its progress:
            self.active_export_task_id = async_result.id
        return self._get_status()

    @XBlock.json_handler
    def cancel_export(self, request, suffix=''):
        from .tasks import export_data as export_data_task  # Import here since this is edX LMS specific
        if self.active_export_task_id:
            async_result = export_data_task.AsyncResult(self.active_export_task_id)
            async_result.revoke()
            self._delete_export()

    def _get_user_attr(self, attr):
        """Get an attribute of the current user."""
        user_service = self.runtime.service(self, 'user')
        if user_service:
            # May be None when creating bok choy test fixtures
            return user_service.get_current_user().opt_attrs.get(attr)
        return None

    def user_is_staff(self):
        """Return a Boolean value indicating whether the current user is a member of staff."""
        return self._get_user_attr('edx-platform.user_is_staff')