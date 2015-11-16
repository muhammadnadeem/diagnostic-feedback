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
from .sub_api import my_api
from .data_tool import ExportDataBlock

log = logging.getLogger(__name__)
loader = ResourceLoader(__name__)


@XBlock.wants('user')
class QuizBlock(ResourceMixin, QuizResultMixin, ExportDataBlock):
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

    def student_view(self, context=None):
        """
        it will loads student view
        :param context: context
        :return: fragment
        """
        context = {
            'questions': copy.deepcopy(self.questions),
            'self': self,
            'user_is_staff': self.user_is_staff()
        }

        from submissions import api as my_api
        if my_api:
            log.info("my api found")
        else:
            log.info("my api not found")

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
        return self.get_fragment(
            context,
            'studio',
            {
                'quiz_type': self.quiz_type,
                'results': self.results,
                'BUZ_FEED_QUIZ_VALUE': self.BUZ_FEED_QUIZ_VALUE,
                'questions': self.questions,
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

                if my_api:
                    log.info("have my_api intance")
                    # Also send to the submissions API:
                    item_key = self.student_item_key
                    item_key['item_id'] = data['question_id']
                    my_api.create_submission(item_key, self.student_choices[data['question_id']])
                else:
                    log.info("not my_api intance")

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







