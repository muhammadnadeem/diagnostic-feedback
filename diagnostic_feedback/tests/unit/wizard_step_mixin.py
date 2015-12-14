import json


class WizardStepMixin(object):
    def save_wizard_step1(self, _type):
        res = json.loads(self._block.handle('save_data', self.make_request(json.dumps({
            "step": 1,
            "title": "Test",
            "description": "Test description",
            "type": _type
        }))).body)
        return res

    def save_buzzfeed_step2(self):
        res = json.loads(self._block.handle('save_data', self.make_request(json.dumps({
            "step": 2,
            "categories": [
                {
                    "group": "group 1",
                    "order": "0",
                    "id": "xxxxxx1",
                    "name": "Category1",
                    "image": "/static/images_course_image.jpg",
                    "internal_description": "this is for cat 1",
                    "html_body": "<p>cat 1 body</p>"
                },
                {
                    "group": "group 2",
                    "order": "1",
                    "id": "xxxxxx2",
                    "name": "Category2",
                    "image": "/static/images_course_image.jpg",
                    "internal_description": "this is for cat 2",
                    "html_body": "<p>cat 2 body</p>"
                }
            ]
        }))).body)
        return res

    def save_diagnostic_step2(self):
        res = json.loads(self._block.handle('save_data', self.make_request(json.dumps({
            "step": 2,
            "ranges": [
                {
                    "group": "group 1",
                    "name": "Range 1",
                    "max_value": "15",
                    "image": "/static/images_course_image.jpg",
                    "min_value": "10",
                    "order": "0",
                    "html_body": "<p>Range 1, group 1</p>"
                },
                {
                    "group": "group 2",
                    "name": "Range 2",
                    "max_value": "20",
                    "image": "/static/images_course_image.jpg",
                    "min_value": "16",
                    "order": "1",
                    "html_body": "<p>Range 2 , Group 2</p>"
                }
            ]
        }))).body)
        return res

    def save_buzzfeed_step3(self):
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
                    "id": "qxxxxxx1",
                    "question_title": "BuzzFeed",
                    "group": "group 1",
                    "order": "0",

                },
                {
                    "question_txt": "This is second question",
                    "choices": [
                        {
                            "choice_txt": "B",
                            "choice_category": "xxxxxx2"
                        }
                    ],
                    "id": "qxxxxxx2",
                    "question_title": "BuzzFeed",
                    "group": "group 2",
                    "order": "1",

                }
            ],

        }))).body)
        return res

    def save_diagnostic_step3(self):
        res = json.loads(self._block.handle('save_data', self.make_request(json.dumps({
            "step": 3,
            "questions": [
                {
                    "choices": [
                        {
                            "choice_value": "12",
                            "choice_txt": "A"
                        },

                        {
                            "choice_value": "2",
                            "choice_txt": "B"
                        }
                    ],
                    "group": "group 1",
                    "question_txt": "<p>It is related to group 1</p>",
                    "question_title": "What is group 1?",
                    "order": "0",
                    "id": "67a40e0b-1a15-453f-bc10-da6b6c16f9b9"
                },
                {
                    "choices": [
                        {
                            "choice_value": "20",
                            "choice_txt": "A"
                        },

                        {
                            "choice_value": "4",
                            "choice_txt": "B"
                        }
                    ],
                    "group": "group 2",
                    "question_txt": "<p>what is group 2?</p>",
                    "question_title": "What is group 2?",
                    "order": "1",
                    "id": "3358fb1d-61ef-4fa4-86c3-b703e9249bc5"
                }]

        }))).body)
        return res
