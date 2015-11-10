import json
import logging
from xblock.core import XBlock
from xblock.fields import Scope, String, Dict, List
from xblockutils.resources import ResourceLoader
from .sub_api import SubmittingXBlockMixin, my_api
from .tasks import export_dg_data as export_data_task
loader = ResourceLoader(__name__)

PAGE_SIZE = 15


# Make '_' a no-op so we can scrape strings
def _(text):
    return text

log = logging.getLogger(__name__)


class ExportDataBlock(XBlock, SubmittingXBlockMixin):
    active_export_task_id = String(
        # The UUID of the celery AsyncResult for the most recent export,
        # IF we are sill waiting for it to finish
        default="",
        scope=Scope.user_state,
    )
    last_export_result = Dict(
        # The info dict returned by the most recent successful export.
        # If the export failed, it will have an "error" key set.
        default=None,
        scope=Scope.user_state,
    )
    display_data = List(
        # The list of results associated with the most recent successful export.
        # Stored separately to avoid the overhead of sending it to the client.
        default=None,
        scope=Scope.user_state,
    )

    def _delete_export(self):
        self.last_export_result = None
        self.display_data = None
        self.active_export_task_id = ''

    def _save_result(self, task_result):
        """ Given an AsyncResult or EagerResult, save it. """
        self.active_export_task_id = ''
        if task_result.successful():
            if isinstance(task_result.result, dict) and not task_result.result.get('error'):
                log.info('------------ _save_result- saving result ---------------')
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
        log.info("------------ in _get_status - return status ---------------")
        log.info(self.download_url_for_last_report)
        return {
            'export_pending': bool(self.active_export_task_id),
            'last_export_result': self.last_export_result,
            'download_url': self.download_url_for_last_report,
        }

    def check_pending_export(self):
        """
        If we're waiting for an export, see if it has finished, and if so, get the result.
        """
        # from .tasks import export_data as export_data_task  # Import here since this is edX LMS specific
        if self.active_export_task_id:
            log.info("------------ in check_pending_export - checking status ---------------")
            async_result = export_data_task.AsyncResult(self.active_export_task_id)
            if async_result.ready():
                self._save_result(async_result)

    @XBlock.json_handler
    def start_export(self, data, suffix=''):
        """ Start a new asynchronous export """
        block_type = "QuizBlock"
        log.info("------------ in start_export ---------------")
        root_block_id = self.scope_ids.usage_id
        root_block_id = unicode(getattr(root_block_id, 'block_id', root_block_id))
        #

        if not self.user_is_staff():
            return {'error': 'permission denied'}

        # Launch task
        self._delete_export()
        # Make sure we nail down our state before sending off an asynchronous task.
        self.save()
        log.info("------------ in start_export - starting async task ---------------")
        if my_api:
            log.info("------------ in start_export - my_api found ---------------")
        else:
            log.info("------------ in start_export - my_api not found ---------------")
        async_result = export_data_task.delay(
            # course_id not available in workbench.
            unicode(getattr(self.runtime, 'course_id', 'course_id')),
            root_block_id
        )
        if async_result.ready():
            log.info("------------ in start_export- task ready ---------------")
            log.info(async_result.id)
            # In development mode, the task may have executed synchronously.
            # Store the result now, because we won't be able to retrieve it later :-/
            if async_result.successful():
                # Make sure the result can be represented as JSON, since the non-eager celery
                # requires that
                json.dumps(async_result.result)
            self._save_result(async_result)
        else:
            log.info("------------ in start_export- saving id ---------------")
            log.info(async_result.id)
            # The task is running asynchronously. Store the result ID so we can query its progress:
            self.active_export_task_id = async_result.id
            #diagnostic_feedback.tasks.export_data
        return self._get_status()

    @XBlock.json_handler
    def cancel_export(self, request, suffix=''):
        # from .tasks import export_data as export_data_task  # Import here since this is edX LMS specific
        if self.active_export_task_id:
            async_result = export_data_task.AsyncResult(self.active_export_task_id)
            async_result.revoke()
            self._delete_export()

    @XBlock.json_handler
    def get_status(self, data, suffix=''):
        return self._get_status()

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