function StudentQuiz(runtime, element) {

    var studentQuiz = this;
    studentQuiz.startOver = false;
    studentQuiz.movingToStep = false;

    /* Javascript for Student view in LMS.*/

    var common = new Common(),
        form = $("#student_view_form"),

    //selectors
        currentAnswerContainer = ".current",
        questionId = '.question_id',
        selectedStudentChoice = 'input[type="radio"]:checked',

        finalResult = '#response_body',
        choiceSelector = '.answer-choice';

    function hideActions() {
        // hide next, previous, finish action button
        // show start over button
        $('ul[role="menu"] a[href*="next"], ul[role="menu"] a[href*="previous"], ul[role="menu"] a[href*="finish"]').hide();
        $('ul[role="menu"] a[href*="cancel"]').show();
    }

    function resetActions() {
        // hide start over button
        // show next, previous, finish action button
        $('ul[role="menu"] a[href*="next"], ul[role="menu"] a[href*="previous"]').show();
        $('ul[role="menu"] a[href*="cancel"]').hide();
    }

    function showResult(result) {
        // shows final result of student
        var imgSrc = result.student_result.img;

        var htmlBody = result.student_result.html_body;

        var html = '<div>';
        if (imgSrc) {
            html += '<img class="result_img" src="' + imgSrc + '" alt="No Result image"> ' +
                '<p id="html_body">' + htmlBody + '</p>';
        }
        else {
            html += '<p id="html_body">' + htmlBody + '</p>';
        }
        html += '</div>';

        $(finalResult).html(html);
        hideActions();
    }

    function getStudentChoice() {
        //Get student selected answer of wizard current question

        var id = $(currentAnswerContainer).find(questionId).val();
        var studentChoice = $(currentAnswerContainer).find(selectedStudentChoice).val();
        return {'question_id': id, 'student_choice': studentChoice};
    }

    function submitQuestionResponse(isLast, currentStep) {
        // this method is called on successful submission and pass the student's seleted value

        var answerHandlerUrl = runtime.handlerUrl(element, 'save_choice');
        var choice = getStudentChoice();
        choice['currentStep'] = currentStep;
        choice['isLast'] = isLast;  //if student given last answer of the question, this flag is true.

        var success = false;
        $.ajax({
            type: "POST",
            url: answerHandlerUrl,
            async: false,
            data: JSON.stringify(choice),
            success: function (response) {
                success = response.success;

                common.showMessage({success: success, warning: false, msg: response.msg});
                debugger;
                if (response.student_result) {
                    showResult(response);
                }
            }
        });
        return success;
    }

    function startOverQuiz() {
        var startOverUrl = runtime.handlerUrl(element, 'start_over_quiz');
        var success = false;
        $.ajax({
            type: "POST",
            url: startOverUrl,
            async: false,
            data: JSON.stringify({}),
            success: function (response) {
                success = response.success;
                resetActions();
            }
        });
        return success;
    }

    $(function ($) {

        function initialize(event) {
            //If the form is reloaded and the user already have answered some of the questions,
            //he will be resumed to where he left.
            var completed_step = parseInt($("#completed_step").val());

            if (completed_step > 0) {
                studentQuiz.movingToStep = true;
                form.children("div").steps("setStep", completed_step);
            }
        }

        function changeStep(event, currentIndex, newIndex) {
            //on every step change this method either save the data to the server or skip it.
            var currentStep = currentIndex + 1;
            var isLast = (newIndex == $("#student_view_form section").length - 1);
            return saveOrSkip(isLast, currentStep);

        }

        function updateResultHtml(event, currentIndex, newIndex) {
            //If the form is reloaded and the user have answered all the questions,
            //he will be showed the result and start over button.

            var isLast = (currentIndex == $("#student_view_form section").length - 1);
            if (isLast) {
                hideActions();
            }
        }

        function startOver(event) {
            //If user have answered all the questions, start over button shown to again start the Quiz
            studentQuiz.startOver = true;
            $(choiceSelector).find('input[type="radio"]').removeAttr('checked');
            form.children("div").steps("setStep", 0);
        }

        form.children("div").steps({
            headerTag: "h3",
            bodyTag: "section",
            transitionEffect: "slideLeft",
            enableCancelButton: true,
            onInit: initialize,
            onStepChanging: changeStep,
            onStepChanged: updateResultHtml,
            onCanceled: startOver,
            labels: {
                cancel: "Start Over",
                current: "current step:",
                finish: "Finish",
                next: "Next",
                previous: "Previous",
                loading: "Loading ..."
            }
        });

        resetActions();
        function saveOrSkip(isLast, currentStep) {

            // if start over button is click just return and do nothing
            if (studentQuiz.startOver) {
                studentQuiz.startOver = false;
                return startOverQuiz();

            } else if (studentQuiz.movingToStep) {
                studentQuiz.movingToStep = false;
                return true;

            } else {
                form.validate().settings.ignore = ":disabled,:hidden";
                var selectedChoice = $("section.answer-choice:visible").find(selectedStudentChoice).val();

                if (selectedChoice != "" && selectedChoice != undefined) {
                    return submitQuestionResponse(isLast, currentStep);
                } else {
                    common.showMessage({success: false, warning: false, msg: 'Please select an answer'});
                    return false;
                }
            }
        }
    });
}
