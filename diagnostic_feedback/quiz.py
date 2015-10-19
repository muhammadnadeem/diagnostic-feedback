"""TO-DO: Write a description of what this XBlock is."""

import logging
import copy

from xblock.core import XBlock
from xblock.fields import Scope, String, List, Integer, Dict
from xblock.fragment import Fragment
from xblockutils.resources import ResourceLoader

from .resource import ResourceMixin
from .quiz_result import QuizResultMixin

from .filters import Range, Category, Question
from .validators import CategoryValidator, RangeValidator, QuizValidator, QuestionValidator , StudentChoiceValidator

log = logging.getLogger(__name__)
loader = ResourceLoader(__name__)


class QuizBlock(XBlock, ResourceMixin, QuizResultMixin):
    """

    """
    BUZ_FEED_QUIZ_VALUE = "BFQ"
    BUZ_FEED_QUIZ_LABEL = "Buzzfeed Quiz"
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

    mode = String(
        default='new',
        scope=Scope.content,
        help='quiz mode new/edit'
    )

    current_step = Integer(
        default=0,
        scope=Scope.content,
        help='to control which step should be shown in editing mode'
    )

    def get_fragment(self, context, view='studio'):
        """
            Return fragment after adding required css/js/html
        """
        fragment = Fragment()
        self.add_templates(fragment, context, view)
        self.add_css(fragment, view)
        self.add_js(fragment, view)
        self.initialize_js_classes(fragment, view)
        return fragment

    def append_append_choice(self, questions):
        """
            Append student choice with each question
        """
        for question in questions:
            if self.quiz_type == self.DIAGNOSTIC_QUIZ_VALUE:
                question['student_choice'] = float(self.student_choices.get(question['id'])) if \
                    self.student_choices.get(question['id']) else ''
            else:
                question['student_choice'] = self.student_choices.get(question['id'], '')

    def student_view(self, context=None):
        """
        Create a fragment, displayed to the student
        """

        context = {
            'questions': copy.deepcopy(self.questions),
            'self' : self,

        }

        if self.student_choices:
            self.append_append_choice(context['questions'])

        return self.get_fragment(context, 'student')

    def studio_view(self, context):
        """
            Create a fragment used to display add/edit quiz in studio view.
        """

        context['self'] = self
        return self.get_fragment(context, 'studio')

    def save_step(self, data):
        """
            save posted data of each step
        """
        step = data['step']
        self.current_step = step

        if step == 1:
            self.title = data['title']
            self.description = data['description']
            if not self.quiz_type and data.get('type'):
                self.quiz_type = data['type']
            self.mode = 'edit'
        elif step == 2 and self.quiz_type == self.BUZ_FEED_QUIZ_VALUE:
            results = Category.filter_results(data)
            self.results = results
        elif step == 2 and self.quiz_type == self.DIAGNOSTIC_QUIZ_VALUE:
            results = Range.filter_results(data)
            self.results = results
        elif step == 3:
            questions = Question.filter_question(data, self.quiz_type)
            self.questions = questions

    def validate_data(self, data):
        """
           validate data for an individual step
        """
        step = data['step']
        valid = False
        msg = ''

        if step == 1:
            valid, msg = QuizValidator.basic_validate(data, self)
        elif step == 2 and self.quiz_type == self.BUZ_FEED_QUIZ_VALUE:
            valid, msg = CategoryValidator.validate(data)
        elif step == 2 and self.quiz_type == self.DIAGNOSTIC_QUIZ_VALUE:
            valid, msg = RangeValidator.validate(data)
        elif step == 3:
            valid, msg = QuestionValidator.validate(data, self)

        return valid, msg

    @XBlock.json_handler
    def save_data(self, data, suffix=''):
        """
            Handler to save data for each step
        """
        success = True
        msg = ""
        step = data.get('step', '')

        if not step:
            success = False
            msg = 'missing step number'
        else:
            try:
                is_step_valid, msg = self.validate_data(data)
                if is_step_valid:
                    self.save_step(data)
                    msg = "step {} data saved".format(data['step'])
                else:
                    success = False

            except Exception as ex:
                success = False
                msg += ex.message if ex.message else str(ex)

        return {'step': step, 'success': success, 'msg': msg}

    @XBlock.json_handler
    def get_template(self, data, suffix=''):
        """
            Handler to return a template to add new html content dynamically using js
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

    @XBlock.json_handler
    def save_choice(self, data, suffix=''):
        """
            Handler to save answers of user
        """
        msg = ""
        result = ''
        try:
            success, result = StudentChoiceValidator.basic_validate(data)
            if success:
                self.student_choices[data['question_id']] = data['student_choice']
                if data['isLast']:
                    if self.quiz_type == self.BUZ_FEED_QUIZ_VALUE:
                        success = True
                        result = self.get_buzz_feed_result()
                    else:
                        success = True
                        result = self.get_diagnostic_result()
        except Exception as ex:
            success = False
            msg += str(ex)
        return {'success': success, 'msg': result}
