"""
Celery task for CSV student answer export.
"""
import time
import json
from celery.task import task
from celery.utils.log import get_task_logger
from opaque_keys.edx.keys import CourseKey
from xmodule.modulestore.django import modulestore
from .sub_api import my_api

logger = get_task_logger(__name__)


@task()
def export_data(course_id, source_block_id_str):
    """
    Exports all answers to all questions by all students to a CSV file.
    """
    start_timestamp = time.time()
    response = {}

    logger.debug("Beginning data export")
    try:
        course_key = CourseKey.from_string(course_id)
        block = modulestore().get_items(course_key, qualifiers={'name': source_block_id_str}, depth=0)[0]
    except IndexError:
        raise ValueError("Could not find the specified Block ID.")
    course_key_str = unicode(course_key)

    # Define the header row of our CSV:
    rows = []

    header = ["Course ID", "Block ID", "Student ID", "Quiz Title", "Final Result"]
    for order in range(len(block.questions)):
        header.append("Question {}".format(order + 1))
        header.append("Answer")

    rows.append(header)

    results = _extract_data(course_key_str, block)
    rows += results

    # Generate the CSV:
    try:
        from instructor_task.models import ReportStore
        filename = u"diagnostic-data-export-{}.csv".format(
            time.strftime("%Y-%m-%d-%H%M%S", time.gmtime(start_timestamp)))
        report_store = ReportStore.from_config(config_name='GRADES_DOWNLOAD')
        report_store.store_rows(course_key, filename, rows)

        generation_time_s = time.time() - start_timestamp
        logger.debug("Done data export - took {} seconds".format(generation_time_s))

        response = {
            "error": None,
            "report_filename": filename,
            "start_timestamp": start_timestamp,
            "generation_time_s": generation_time_s,
            "display_data": [] if len(rows) == 1 else rows
        }

    except Exception:
        pass

    return response


def _extract_data(course_key_str, block):
    """
    Extract results for `block`.
    """
    rows = []

    # Extract info for "Section", "Subsection", and "Unit" columns
    # section_name, subsection_name, unit_name = _get_context(block)

    # Extract info for "Type" column
    block_type = _get_type(block)

    block_id = block.get_block_id()

    for submission in _get_submissions(course_key_str, block_type, block_id):
        data = json.loads(submission['answer'])

        row = [course_key_str, block_id, submission['student_id'], block.title, data.get('final_result', '')]
        for question in block.questions:
            row.append(data.get(question['id'], '').get('question_text'))
            row.append(data.get(question['id'], '').get('answer'))

        rows.append(row)

    return rows


def _get_type(block):
    """
    Return type of `block`.
    """
    return block.scope_ids.block_type


def _get_submissions(course_key_str, block_type, block_id):
    """
    Return submissions for 'question'.
    """
    # Load the actual student submissions for `question`.
    # Note this requires one giant query that retrieves all student submissions for `question` at once.
    logger.debug('in _get_submissions: ')
    return my_api.get_all_submissions(course_key_str, block_id, block_type)
