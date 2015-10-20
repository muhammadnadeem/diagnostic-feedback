function StudentQuiz(runtime, element) {
    /* Javascript for Student view in LMS.*/

    var common = new Common();
    var form = $("#student_view_form");

    //selctors for student answer
    var currentAnswerContainer = ".current";
    var questionId = '.question_id';
    var selectedStudentChoice = 'input[type="radio"]:checked';

    // Selector for showing result
    var finalResult = '#response_body';
    var actions = "ul[role='menu']";


    function showResult(result) {
        // shows final result of student

        if (result.success && result.student_result.msg) {
            var imgSrc = result.student_result.img;
            var htmlBody = result.student_result.html_body;
            var html = '';
            if (imgSrc) {
                html = '<div><img class="result_img" src="' + imgSrc + '" alt="No Result image"> ' +
                    '<p id="html_body">' + htmlBody + '</p></div>';
            }
            else {
                html = '<div><p id="html_body">' + htmlBody + '</p></div>';
            }
            $(finalResult).html(html);
            $(actions).hide()
        }
    }


    function getStudentChoice() {
        //Get student selected answer of wizard current question

        var id = $(currentAnswerContainer).find(questionId).val();
        var studentChoice = $(currentAnswerContainer).find(selectedStudentChoice).val();
        return {'question_id': id, 'student_choice': studentChoice};
    }


    function submitQuestionResponse(isLast) {
        // this method is called on successful submission and pass the student's seleted value

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
            headerTag: "h3",
            bodyTag: "section",
            transitionEffect: "slideLeft",
            onStepChanging: function (event, currentIndex, newIndex) {
                if (newIndex == $("#student_view_form section").length - 1) {
                    return saveToServer(true);
                } else {
                    return saveToServer(false);
                }
            }
        });

        function saveToServer(isLast) {

            form.validate().settings.ignore = ":disabled,:hidden";
            var selectedChoice = $("section.answer-choice:visible").find(selectedStudentChoice).val();

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
