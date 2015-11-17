function StudentQuiz(runtime, element) {

    var studentQuiz = this;
    studentQuiz.startOver = false;
    studentQuiz.movingToStep = false;

    /* Javascript for Student view in LMS.*/

    var common = new Common(),
        form = $(".diagnostic-feedback #student_view_form"),
        studentViewFormSelector = ".diagnostic-feedback #student_view_form",

        //selectors
        currentAnswerContainer = ".diagnostic-feedback .current",
        questionId = '.question-id',
        selectedStudentChoice = 'input[type="radio"]:checked',

        finalResult = '.diagnostic-feedback #response_body',
        choiceSelector = '.diagnostic-feedback .answer-choice',

        nextActionSelector = '.diagnostic-feedback ul[role="menu"] a[href*="next"]',
        previousActionSelector = '.diagnostic-feedback ul[role="menu"] a[href*="previous"]',
        finishActionSelector = '.diagnostic-feedback ul[role="menu"] a[href*="finish"]',
        cancelActionSelector = '.diagnostic-feedback ul[role="menu"] a[href*="cancel"]',
        completedStepSelector = ".diagnostic-feedback #completed_step",
        studentViewFormSecSelector = ".diagnostic-feedback #student_view_form section",
        choiceSelectedBtnSelector = "input[type='radio']",
        exportProgressSelector = '.diagnostic-feedback #export_progress',
        exportDataBtnSelector = "#export_data";

    function hideActions() {
        // hide next, previous, finish action button
        // show start over button
        $(nextActionSelector + ', '+ previousActionSelector + ', ' + finishActionSelector ).hide();
        $(cancelActionSelector).show();
    }

    function resetActions() {
        // hide start over button
        // show next, previous, finish action button
        $(nextActionSelector + ', ' + previousActionSelector).show();
        $(cancelActionSelector).hide();
    }

    function showResult(result) {
        // shows final result of student
        var imgSrc = result.student_result.img;

        var htmlBody = result.student_result.html_body;

        var html = '<div>';
        if (imgSrc) {
            html += '<img class="result-img" src="' + imgSrc + '" alt="No Result image"> ' +
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
        // this method is called on valid submission and pass the student's selected value
        common.clearErrors();
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

                //common.showMessage({success: success, warning: false, msg: response.msg});
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
            var completedStep = parseInt($(completedStepSelector).val());

            if (completedStep > 0) {
                studentQuiz.movingToStep = true;
                form.children("div").steps("setStep", completedStep);
            }
        }

        function changeStep(event, currentIndex, newIndex) {
            //on every step change this method either save the data to the server or skip it.
            var currentStep = currentIndex + 1;
            var isLast = (newIndex == $(studentViewFormSecSelector).length - 1);
            return saveOrSkip(isLast, currentStep);

        }

        function updateResultHtml(event, currentIndex, newIndex) {
            //If the form is reloaded and the user have answered all the questions,
            //he will be showed the result and start over button.

            var isLast = (currentIndex == $(studentViewFormSecSelector).length - 1);
            if (isLast) {
                hideActions();
            }
        }

        function startOver(event) {
            //If user have answered all the questions, start over button shown to again start the Quiz
            studentQuiz.startOver = true;
            $(choiceSelector).find(choiceSelectedBtnSelector).removeAttr('checked');
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
                    common.showValidationError({success: false, warning: false, msg: 'Please select an answer'});
                    return false;
                }
            }
        }

        function getStatus() {
            $.ajax({
                type: 'POST',
                url: runtime.handlerUrl(element, 'get_status'),
                data: '{}',
                success: updateStatus,
                dataType: 'json'
            });
        }

        function updateStatus(response) {
            console.log(response);
	        if(response.export_pending){
                $(exportProgressSelector).html('The report is currently being generated…');
                setTimeout(getStatus, 1000);
            } else {
               $(exportProgressSelector).html('Report is successfully generated. Downloading…');
                window.location.href = response.download_url;
            }
        }


        $(studentViewFormSelector, element).on('click', exportDataBtnSelector, function(eventObject) {
            eventObject.preventDefault();

            var link = $(eventObject.currentTarget);
            var handlerUrl = runtime.handlerUrl(element, 'start_export');

            $.ajax({
                type: 'POST',
                url: handlerUrl,
                data: JSON.stringify({}),
                success: updateStatus,
                error: function (result) {
                    alert(response);
                },
                dataType: 'json'
            });

        });

    });
}
