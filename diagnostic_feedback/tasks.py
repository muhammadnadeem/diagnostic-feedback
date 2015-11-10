"""
Celery task for CSV student answer export.
"""
import time

from celery.task import task
from celery.utils.log import get_task_logger
from instructor_task.models import ReportStore
from opaque_keys.edx.keys import CourseKey
from xmodule.modulestore.django import modulestore
from .sub_api import my_api

logger = get_task_logger(__name__)


@task()
def export_dg_data(course_id, source_block_id_str):
    """
    Exports all answers to all questions by all students to a CSV file.
    """
    start_timestamp = time.time()

    logger.debug("Beginning data export")
    try:
        course_key = CourseKey.from_string(course_id)
        block = modulestore().get_items(course_key, qualifiers={'name': source_block_id_str}, depth=0)[0]
    except IndexError:
        raise ValueError("Could not find the specified Block ID.")
    course_key_str = unicode(course_key)

    # Define the header row of our CSV:
    rows = []
    rows.append(["Question", "Answer"])

    results = _extract_data(course_key_str, block)
    rows += results

    # Generate the CSV:
    filename = u"diagnostic-data-export-{}.csv".format(time.strftime("%Y-%m-%d-%H%M%S", time.gmtime(start_timestamp)))
    report_store = ReportStore.from_config(config_name='GRADES_DOWNLOAD')
    report_store.store_rows(course_key, filename, rows)

    generation_time_s = time.time() - start_timestamp
    logger.debug("Done data export - took {} seconds".format(generation_time_s))

    return {
        "error": None,
        "report_filename": filename,
        "start_timestamp": start_timestamp,
        "generation_time_s": generation_time_s,
        "display_data": [] if len(rows) == 1 else rows
    }


def _extract_data(course_key_str, block):
    """
    Extract results for `block`.
    """
    rows = []

    # Extract info for "Section", "Subsection", and "Unit" columns
    # section_name, subsection_name, unit_name = _get_context(block)

    # Extract info for "Type" column
    block_type = _get_type(block)

    # Extract info for "Answer" column
    # - Get all of the most recent student submissions for this block:
    for question in block.questions:
        # Extract info for "Question" column
        question_id, question_title = _get_question(question)
        submissions = _get_submissions(course_key_str, block_type, question_id)

        # - For each submission, look up student's answer:
        answer_cache = {}
        for submission in submissions:

            answer = _get_answer(block, question, submission, answer_cache)

            rows.append([question_title, answer])

    return rows


def _get_type(block):
    """
    Return type of `block`.
    """
    return block.scope_ids.block_type


def _get_question(question):
    """
    Return question for `block`; default to question ID if `question` is not set.
    """
    return question['id'], question['title']


def _get_submissions(course_key_str, block_type, question_id):
    """
    Return submissions for 'question'.
    """
    # Load the actual student submissions for `question`.
    # Note this requires one giant query that retrieves all student submissions for `question` at once.
    logger.debug('in _get_submissions: ')
    return my_api.get_all_submissions(course_key_str, question_id, block_type)


def _get_answer(block, question, submission, answer_cache):
    """
    Return answer associated with `submission` to `block`.

    `answer_cache` is a dict that is reset for each block.
    """
    answer = submission['answer']
    # Convert from answer to answer label
    if answer not in answer_cache:
        answer_cache[answer] = _get_answer_display(block, question, answer)
    return answer_cache[answer]


def _get_answer_display(block, question, student_choice):
    """
    Get the human-readable version of a student_choice value
    """
    for choice in question['choices']:
        _value = str(choice['value']) if block.quiz_type == block.DIAGNOSTIC_QUIZ_VALUE else choice['category_id']
        if _value == student_choice:
            return choice['name']
    return question