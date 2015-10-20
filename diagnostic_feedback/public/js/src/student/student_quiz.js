/* Javascript for MyXBlock. */
function StudentQuiz(runtime, element) {

    var studentQuiz = this;
    studentQuiz.startOver = false;
    studentQuiz.clearPreviousResults = false;

    var common = new Common();

    //selectors
    var choiceSelector = '.answer-choice';

    function hideActions(){
        $('ul[role="menu"] a[href*="next"], ul[role="menu"] a[href*="previous"], ul[role="menu"] a[href*="finish"]').hide();
        $('ul[role="menu"] a[href*="cancel"]').show();
    }

    function resetActions(){
        $('ul[role="menu"] a[href*="next"], ul[role="menu"] a[href*="previous"]').show();
        $('ul[role="menu"] a[href*="cancel"]').hide();
    }

    function showResult(result) {
        if (result.success && result.msg.msg) {
            var imgSrc = result.msg.img;
            var resultClass = 'success';
            var htmlBody = result.msg.html_body;
            var html = '<div>';
            if (imgSrc) {
                html += '<img class="result_img" src="' + imgSrc + '" alt="Smiley face"> ' +
                    '<p id="html_body">' + htmlBody + '</p>';
            }
            else {
                html += '<p id="html_body">' + htmlBody + '</p>';
            }
            html += '</div>';
            $('#response_body').html(html);
            hideActions();
        }
    }

    function getStudentChoice() {
        var answerContainers = $(".current");
        var question_id = $(answerContainers).find('.question_id').val();
        var student_choice = $(answerContainers).find('input[type="radio"]:checked').val();
        return {'question_id': question_id, 'student_choice': student_choice};
    }

    function submitQuestionResponse(isLast) {
        var answerHandlerUrl = runtime.handlerUrl(element, 'save_choice');
        var choice = getStudentChoice();
        choice['isLast'] = isLast;
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


        var form = $("#student_view_form");

        form.children("div").steps({
            headerTag: "h3",
            bodyTag: "section",
            transitionEffect: "slideLeft",
            enableCancelButton: true,
            onStepChanging: function (event, currentIndex, newIndex) {
                if(newIndex == $("#student_view_form section").length - 1){
                    console.log('showing result');
                    return saveToServer(true);
                } else {
                    return saveToServer(false);
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

        function saveToServer(isLast) {
            form.validate().settings.ignore = ":disabled,:hidden";
            var selectedChoice = $("section.answer-choice:visible").find('input[type="radio"]:checked').val();
            // if start over button is click just return and do nothing
            if (studentQuiz.startOver){
                studentQuiz.startOver = false;
                resetActions();
                return true;
            }else {
                if (selectedChoice != "" && selectedChoice != undefined) {
                    submitQuestionResponse(isLast);
                    return true;
                } else {
                    common.showMessage({success: false, warning: false, msg: 'Please select an answer'})
                    return false;
                }
            }

        }

    });
}
