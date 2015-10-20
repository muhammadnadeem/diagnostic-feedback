/* Javascript for MyXBlock. */
function StudentQuiz(runtime, element) {
    var common = new Common();
    var form = $("#student_view_form");

    // tags define for wizard steps
    var bodytag = "section";
    var headerTag = "h3";
    
    var currentAnswerContainer = ".current";
    var question_id = '.question_id';

     /*shows final result of student*/
    function showResult(result) {
        if (result.success && result.msg.msg) {
            var imgSrc = result.msg.img;
            var resultClass = 'success';
            var htmlBody = result.msg.html_body;
            var html = '';
            if (imgSrc) {
                html = '<div><img class="result_img" src="' + imgSrc + '" alt="Smiley face"> ' +
                    '<p id="html_body">' + htmlBody + '</p></div>';
            }
            else {
                html = '<div><p id="html_body">' + htmlBody + '</p></div>';
            }
            $('#response_body').html(html);
            $("ul[role='menu']").hide()
        }
    }

    //Get student selected answer of wizard current question
    function getStudentChoice() {
        var id = $(currentAnswerContainer).find(question_id).val();
        var student_choice = $(currentAnswerContainer).find('input[type="radio"]:checked').val();
        return {'question_id': id, 'student_choice': student_choice};
    }

    // this method is called on successful submission and pass the student's seleted value
    function submitQuestionResponse(isLast) {
        var answerHandlerUrl = runtime.handlerUrl(element, 'save_choice');
        var choice = getStudentChoice();
        choice['isLast'] = isLast;  //if student given last answer of the question, this flag is true.
        $.ajax({
            type: "POST",
            url: answerHandlerUrl,
            data: JSON.stringify(choice),
            success: showResult
        });
    }

    $(function ($) {
        form.children("div").steps({
            headerTag: headerTag,
            bodyTag: bodytag,
            transitionEffect: "slideLeft",
            onStepChanging: function (event, currentIndex, newIndex) {
                if(newIndex == $("#student_view_form section").length - 1){
                    console.log('showing result');
                    return saveToServer(true);
                } else {
                    return saveToServer(false);
                }
            }
        });

        function saveToServer(isLast) {
            form.validate().settings.ignore = ":disabled,:hidden";
            var selectedChoice = $("section.answer-choice:visible").find('input[type="radio"]:checked').val();

            if (selectedChoice != "" && selectedChoice != undefined) {
                submitQuestionResponse(isLast);
                return true;
            } else {
                common.showMessage({success: false, warning: false, msg: 'Please select an answer'})
                return false;
            }
        }
    });
}
