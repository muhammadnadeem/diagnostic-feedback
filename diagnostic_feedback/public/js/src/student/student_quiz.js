function StudentQuiz(runtime, element) {

    var studentQuiz = this;
    studentQuiz.startOver = false;
    studentQuiz.clearPreviousResults = false;

    /* Javascript for Student view in LMS.*/

    var common = new Common(),
    form = $("#student_view_form"),

    //selectors
    currentAnswerContainer = ".current",
    questionId = '.question_id',
    selectedStudentChoice = 'input[type="radio"]:checked',

    finalResult = '#response_body',
    choiceSelector = '.answer-choice';

    function hideActions(){
        // hide next, previous, finish action button
        // show start over button
        $('ul[role="menu"] a[href*="next"], ul[role="menu"] a[href*="previous"], ul[role="menu"] a[href*="finish"]').hide();
        $('ul[role="menu"] a[href*="cancel"]').show();
    }

    function resetActions(){
        // hide start over button
        // show next, previous, finish action button
        $('ul[role="menu"] a[href*="next"], ul[role="menu"] a[href*="previous"]').show();
        $('ul[role="menu"] a[href*="cancel"]').hide();
    }

    function showResult(result) {
        // shows final result of student

        if (result.success && result.student_result.msg) {
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
        choice['clearPreviousData'] = studentQuiz.clearPreviousResults;
        if(studentQuiz.clearPreviousResults) {
            studentQuiz.clearPreviousResults = false;
        }

        $.ajax({
            type: "POST",
            url: answerHandlerUrl,
            data: JSON.stringify(choice),
            success: showResult
        });
    }

    $(function ($) {

        form.children("div").steps({
            headerTag: "h3",
            bodyTag: "section",
            transitionEffect: "slideLeft",
            enableCancelButton: true,
            onStepChanging: function (event, currentIndex, newIndex) {
                currentStep = currentIndex + 1;
                if (newIndex == $("#student_view_form section").length - 1) {
                    return saveToServer(true, currentStep);
                } else {
                    return saveToServer(false, currentStep);
                }
            },
            onCanceled:function (event) {
                studentQuiz.startOver = true;
                studentQuiz.clearPreviousResults = true;
                $(choiceSelector).find('input[type="radio"]').removeAttr('checked');
                form.children("div").steps("setStep", 0);
            },
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

        function saveToServer(isLast, currentStep) {

            form.validate().settings.ignore = ":disabled,:hidden";
            var selectedChoice = $("section.answer-choice:visible").find(selectedStudentChoice).val();

            // if start over button is click just return and do nothing
            if (studentQuiz.startOver){
                studentQuiz.startOver = false;
                resetActions();
                return true;
            }else {
                if (selectedChoice != "" && selectedChoice != undefined) {
                    submitQuestionResponse(isLast, currentStep);
                    return true;
                } else {
                    common.showMessage({success: false, warning: false, msg: 'Please select an answer'})
                    return false;
                }
            }
        }
    });
}
