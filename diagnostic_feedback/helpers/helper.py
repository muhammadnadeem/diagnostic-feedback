from . import Range, Category, Question


class MainHelper(object):
    @classmethod
    def save_filtered_data(cls, quiz, data):
        """
            filter out & save the posted data to match our required schema for each quiz step
        """
        step = data['step']

        if step == 1:
            quiz.title = data['title']
            quiz.description = data['description']
            if not quiz.quiz_type and data.get('type'):
                quiz.quiz_type = data['type']

        if step == 2 and quiz.quiz_type == quiz.BUZZFEED_QUIZ_VALUE:
            results = Category.filter_results(data)
            quiz.results = results

        elif step == 2 and quiz.quiz_type == quiz.DIAGNOSTIC_QUIZ_VALUE:
            results = Range.filter_results(data)
            quiz.results = results

        elif step == 3:
            questions = Question.filter_question(data, quiz.quiz_type)
            quiz.questions = questions

        else:
            pass

        return "step {} data saved".format(step)
