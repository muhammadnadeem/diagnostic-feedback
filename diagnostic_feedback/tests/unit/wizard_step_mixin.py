import json


class WizardStepMixin(object):
    def save_wizard_step1(self, type):
        res = json.loads(self._block.handle('save_data', self.make_request(json.dumps({
            "step": 1,
            "title": "Test",
            "description": "Test description",
            "type": type
        }))).body)
        return res

    def save_buzfeed_step2(self):
        res = json.loads(self._block.handle('save_data', self.make_request(json.dumps({
            "step": 2,
            "categories": [
                {
                    "id": "xxxxxx1",
                    "name": "Category1",
                    "image": "http://abc.com",
                    "html_body": ""
                },
                {
                    "id": "xxxxxx2",
                    "name": "Category2",
                    "image": "http://xyz.com",
                    "html_body": ""
                }
            ]
        }))).body)
        return res

    def save_diagnostic_step2(self):
        res = json.loads(self._block.handle('save_data', self.make_request(json.dumps({
            "step": 2,
            "ranges": [
                {
                    "name": "A",
                    "min_value": "5",
                    "max_value": "50",
                    "image": "",
                    "html_body": ""
                },
                {
                    "name": "B",
                    "min_value": "55",
                    "max_value": "60",
                    "image": "",
                    "html_body": ""
                }
            ]
        }))).body)
        return res

    def save_buzfeed_step3(self):
        res = json.loads(self._block.handle('save_data', self.make_request(json.dumps({
            "step": 3,
            "questions": [
                {
                    "question_txt": "This is 1st question",
                    "choices": [
                        {
                            "choice_txt": "A",
                            "choice_category": "xxxxxx1"
                        },
                        {
                            "choice_txt": "B",
                            "choice_category": "xxxxxx2"
                        }
                    ],
                    "id": "qxxxxxx1"
                },
                {
                    "question_txt": "This is second question",
                    "choices": [
                        {
                            "choice_txt": "B",
                            "choice_category": "xxxxxx2"
                        }
                    ],
                    "id": "qxxxxxx2"
                }
            ]
        }))).body)
        return res

    def save_diagnostic_step3(self):
        res = json.loads(self._block.handle('save_data', self.make_request(json.dumps({
            "step": 3,
            "questions": [
                {
                    "choices": [
                        {
                            "choice_txt": "a",
                            "choice_value": "2.0"
                        },
                        {
                            "choice_txt": "b",
                            "choice_value": "3.0"},
                        {
                            "choice_txt": "c",
                            "choice_value": "5.0"
                        }
                    ],
                    "id": "a93bb28f-a3be-40bc-8405-a46d10ade37a",
                    "question_txt": "what is a?"
                },
                {
                    "choices": [
                        {
                            "choice_txt": "a",
                            "choice_value": "2.0"
                        },
                        {
                            "choice_txt": "b",
                            "choice_value": "3.0"},
                        {
                            "choice_txt": "c",
                            "choice_value": "5.0"
                        }
                    ],
                    "id": "6e4b4aef-6b80-4525-b00f-5430f6c6f75f",
                    "question_txt": "what is b?"}]

        }))).body)
        return res
