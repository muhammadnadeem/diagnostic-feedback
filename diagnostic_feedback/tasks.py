"""
Celery task for CSV student answer export.
"""
import time

from celery.task import task
from celery.utils.log import get_task_logger
from instructor_task.models import ReportStore
from opaque_keys.edx.keys import CourseKey

from xmodule.modulestore.django import modulestore
from xmodule.modulestore.exceptions import ItemNotFoundError

from .quiz import QuizBlock
from .sub_api import sub_api

logger = get_task_logger(__name__)


@task()
def export_data(course_id, source_block_id_str, block_type):
    """
    Exports student answers to all MCQ questions to a CSV file.
    """
    start_timestamp = time.time()


    logger.debug("Beginning data export")
    try:
        course_key = CourseKey.from_string(course_id)
        block = modulestore().get_items(course_key, qualifiers={'name': source_block_id_str}, depth=0)[0]
    except IndexError:
        raise ValueError("Could not find the specified Block ID.")
    course_key_str = unicode(course_key)

    # type_map = {cls.__name__: cls for cls in [QuizBlock]}
    # block_type = tuple(type_map[block_type])

    # Define the header row of our CSV:
    rows = []
    rows.append(["Section", "Subsection", "Unit", "Type", "Question", "Answer"])

    results = _extract_data(course_key_str, block, None)
    rows += results

    # Generate the CSV:
    import pudb; pu.db

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
        "display_data": [] if len(rows) == 1 else rows[1:1001]  # Limit to preview of 1000 items
    }


def _extract_data(course_key_str, block, user_id):
    """
    Extract results for `block`.
    """
    rows = []

    # Extract info for "Section", "Subsection", and "Unit" columns
    section_name, subsection_name, unit_name = _get_context(block)

    # Extract info for "Type" column
    block_type = _get_type(block)



    # Extract info for "Answer" and "Username" columns
    # - Get all of the most recent student submissions for this block:
    for question in block.questions:
        # Extract info for "Question" column
        question_id, question_title = _get_question(question)
        submissions = _get_submissions(course_key_str, block_type, question_id, user_id)

        # - For each submission, look up student's username and answer:
        answer_cache = {}
        for submission in submissions:

            # username = _get_username(submission, user_id)
            answer = _get_answer(block, submission, answer_cache)

            rows.append([section_name, subsection_name, unit_name, block_type, question_title, answer])

    return rows


def _get_context(block):
    """
    Return section, subsection, and unit names for `block`.
    """
    block_names_by_type = {}
    block_iter = block
    while block_iter:
        block_iter_type = block_iter.scope_ids.block_type
        block_names_by_type[block_iter_type] = block_iter.display_name_with_default
        block_iter = block_iter.get_parent() if block_iter.parent else None
    section_name = block_names_by_type.get('chapter', '')
    subsection_name = block_names_by_type.get('sequential', '')
    unit_name = block_names_by_type.get('vertical', '')
    return section_name, subsection_name, unit_name


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


def _get_submissions(course_key_str, block_type, block_id, user_id):
    """
    Return submissions for `block`.
    """
    # Load the actual student submissions for `block`.
    # Note this requires one giant query that retrieves all student submissions for `block` at once.

    # block_type = _get_type(block)
    # block_id = block.name  # item_id of Long Answer submission matches question ID and not block ID

    return sub_api.get_all_submissions(course_key_str, block_id, block_type)


def _get_username(submission, user_id):
    """
    Return username of student who provided `submission`.
    """
    # If the student ID key doesn't exist, we're dealing with a single student and know the ID already.
    student_id = submission.get('student_id', user_id)
    return user_by_anonymous_id(student_id).username


def _get_answer(block, submission, answer_cache):
    """
    Return answer associated with `submission` to `block`.

    `answer_cache` is a dict that is reset for each block.
    """
    answer = submission['answer']
    # if isinstance(block, QuizBlock):
    #     # Convert from answer ID to answer label
    #     if answer not in answer_cache:
    #         answer_cache[answer] = block.get_submission_display(answer)
    #     return answer_cache[answer]
    return answer
