import unittest

from webob import Request
from workbench.runtime import WorkbenchRuntime
from xblock.fields import ScopeIds
from xblock.runtime import KvsFieldData, DictKeyValueStore

import diagnostic_feedback


class BaseTest(unittest.TestCase):

    def make_request(self, body, method='POST'):
        request = Request.blank('/')
        request.method = 'POST'
        request.body = body.encode('utf-8')
        request.method = method
        return request

    def make_block(self):
        block_type = 'diagnostic_feedback'
        key_store = DictKeyValueStore()
        field_data = KvsFieldData(key_store)
        runtime = WorkbenchRuntime()
        def_id = runtime.id_generator.create_definition(block_type)
        usage_id = runtime.id_generator.create_usage(def_id)
        scope_ids = ScopeIds('user', block_type, def_id, usage_id)
        return diagnostic_feedback.QuizBlock(runtime, field_data, scope_ids=scope_ids)
