function StudentQuiz(runtime, element, initData) {
  "use strict";
  /* Javascript for Student view in LMS.*/

  var runtime = runtime,
    element = element;

  var studentQuiz = this;
  studentQuiz.startOver = false;
  studentQuiz.movingToStep = false;

  if (typeof gettext == "undefined") {
    window.gettext = function gettext_stub(string) {
      return string;
    };
    window.ngettext = function ngettext_stub(strA, strB, n) {
      return n == 1 ? strA : strB;
    };
  }

  $(function ($) {

    // selector' for elements that are present in DOM or either required in jQuery.steps callback functions
    var common = new Common(runtime, element),

    // selector' to scope elements for the current XBlock instance, to
    // differentiate multiple diagnostic feedback blocks on one page
      $exportProgress = $('.diagnostic-feedback .export_progress', element),
      $form = $(".diagnostic-feedback .student_view_form", element),

    // child selector' which are either searched in an element already in current XBlock instance scope OR
    // used as combination with some other selector, will be scoped to current XBlock instance (if required)
    // at their usage places
      finalResult = '.diagnostic-feedback .response_body',
      studentViewFormSelector = ".diagnostic-feedback.diagnostic-feedback-student",
      completedStepSelector = ".diagnostic-feedback .completed_step",
      nextActionSelector = '.diagnostic-feedback ul[role="menu"] a[href*="next"]',
      previousActionSelector = '.diagnostic-feedback ul[role="menu"] a[href*="previous"]',
      finishActionSelector = '.diagnostic-feedback ul[role="menu"] a[href*="finish"]',
      cancelActionSelector = '.diagnostic-feedback ul[role="menu"] a[href*="cancel"]',
      choiceSelectedBtnSelector = "input[type='radio']",
      choiceSelector = '.diagnostic-feedback .answer-choice',
      visibleAnswerChoice = 'section.answer-choice.current',
      currentAnswerContainer = ".diagnostic-feedback .current",
      studentViewFormSecSelector = ".diagnostic-feedback .student_view_form section",
      questionId = '.question-id',
      selectedStudentChoice = 'input[type="radio"]:checked',
      exportDataBtnSelector = ".export_data";

    //log event for xblock loaded
    common.publishEvent({
      event_type: 'xblock.diagnostic_feedback.quiz.loaded',
      quiz_type: initData.quiz_type,
      quiz_title: initData.quiz_title
    });

    $form.children("div").steps({
      headerTag: "h3",
      bodyTag: "section",
      transitionEffect: "slideLeft",
      enableCancelButton: true,
      onInit: initialize,
      onStepChanging: changeStep,
      onStepChanged: updateResultHtml,
      onCanceled: startOver,
      labels: {
        cancel: gettext("Start Over"),
        current: gettext("Current Step"),
        finish: gettext("Finish"),
        next: gettext("Next"),
        previous: gettext("Previous"),
        loading: gettext("Loading ...")
      }
    });

    resetActions();

    function hideActions() {
      // hide next, previous, finish action button
      // show start over button
      $(nextActionSelector + ', ' + previousActionSelector + ', ' + finishActionSelector, element).hide();
      $(cancelActionSelector, element).show();
    }

    function resetActions() {
      // hide start over button
      // show next, previous, finish action button
      $(nextActionSelector + ', ' + previousActionSelector, element).show();
      $(cancelActionSelector, element).hide();
        disableButton();
    }

    function disableButton(){
      $(nextActionSelector, element).parent().addClass("disabled").attr("aria-" + "disabled", "true");
    }

     function enableButton(){
         $(nextActionSelector, element).parent().removeClass("disabled").attr("aria-" + "disabled", "false");;
     }

    function showResult(result) {
      // shows result of student
      var finalResultHtml = '<div class="html_body">' + result.html_body + '</div>';
      $(finalResult, element).html(finalResultHtml);
      hideActions();
      common.publishEvent({
       event_type: 'xblock.diagnostic_feedback.quiz.result',
       result_content: finalResultHtml
      });
    }

    function getStudentChoice() {
      //Get student selected answer of wizard current question

      var id = $(currentAnswerContainer, element).find(questionId).val();
      var studentChoice = $(currentAnswerContainer, element).find(selectedStudentChoice).val();
      return {'question_id': id, 'student_choice': studentChoice};
    }

    function getQuestionEventData(choice) {
      // get text of question and selected answer text
      var choice = $('input[type="radio"][value="' + choice + '"]:visible'),
        student_choice = choice.next().text(),
        question_txt = choice.parent().prev().find('p').text();

      return {'question_txt': question_txt, 'student_choice': student_choice}
    }

    function submitQuestionResponse(isLast, currentStep, newIndex) {
      // this method is called on valid submission and pass the student's selected value

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

          if (success && response.student_result) {
            //log event for quiz finish

            var event_data = {
              event_type: 'xblock.diagnostic_feedback.quiz.finish',
              quiz_type: initData.quiz_type,
              quiz_title: initData.quiz_title,
              current_question: currentStep
            };

            common.publishEvent(event_data);
            showResult(response.student_result);
          }

          var qEventData = getQuestionEventData(choice.student_choice);

          var event_data = {
              event_type: '',
              question_txt: qEventData.question_txt,
              student_choice: qEventData.student_choice,
              current_question: currentStep,
              is_last_question: isLast
          };

          if(success){
            //log event for question submission success
            event_data.event_type = 'xblock.diagnostic_feedback.quiz.question.submitted';
            common.publishEvent(event_data);

            //log event for loading question
            if (!isLast) {
              common.publishEvent({
                event_type: 'xblock.diagnostic_feedback.quiz.question.loading',
                question_number: newIndex + 1,
                is_last_question: isLast
              });
            }

          } else {
            //log event for quesiton submission error
            event_data.event_type = 'xblock.diagnostic_feedback.quiz.question.submitError';
            event_data.response_msg = response.response_msg;
            common.publishEvent(event_data);
          }
        }
      });
      return success;
    }

    function startOverQuiz() {
      var startOverUrl = runtime.handlerUrl(element, 'start_over_quiz');
      var success = false;
      var event_type = 'xblock.diagnostic_feedback.quiz.startover',
        event_data = {
        event_type: event_type,
        quiz_type: initData.quiz_type,
        quiz_title: initData.quiz_title
      };

      //log event for quiz startover
      common.publishEvent(event_data);


      $.ajax({
        type: "POST",
        url: startOverUrl,
        async: false,
        data: JSON.stringify({}),
        success: function (response) {
          success = response.success;
          resetActions();

          if(success){
            event_data.event_type = 'xblock.diagnostic_feedback.quiz.startover.scuccess';
          } else {
            event_data.event_type = 'xblock.diagnostic_feedback.quiz.startover.failed';
          }
          event_data.response_message = response.msg;
        }
      });



      //log event for quiz startover success/failure
      common.publishEvent(event_data);
      return success;
    }


    function initialize(event) {
      //If the form is reloaded and the user already have answered some of the questions,
      //he will be resumed to where he left.

      resizeContentContainer();
      var eventData = {
        event_type: 'xblock.diagnostic_feedback.quiz.started',
        quiz_type: initData.quiz_type,
        quiz_title: initData.quiz_title
      };

      var totalQuestions = $('.question-container').length;
      var completedStep = parseInt($(completedStepSelector, element).val()) ;
      if (completedStep == totalQuestions){
        eventData.completed_questions = totalQuestions;
        // log event for result loading
        common.publishEvent({
          event_type: 'xblock.diagnostic_feedback.quiz.result.loading'
        });
      } else {
        eventData.completed_questions = completedStep;
        eventData.current_question =  completedStep + 1;
        //log event for xblock started
        common.publishEvent(eventData);
      }

      if (completedStep > 0) {
        studentQuiz.movingToStep = true;
        $form.children("div").steps("setStep", completedStep);
      }

    }

    function changeStep(event, currentIndex, newIndex) {
      //on every step change this method either save the data to the server or skip it.

      var btn = $(nextActionSelector, element).parent();
      if(btn.hasClass('disabled') && newIndex > currentIndex ){
            return false;
        }
        var currentStep = currentIndex + 1;
      var isLast = (newIndex == $(studentViewFormSecSelector, element).length - 1);

      var status = saveOrSkip(isLast, currentStep, currentIndex, newIndex);
      if(status == true){
        if(isLast){
          common.publishEvent({
            event_type: 'xblock.diagnostic_feedback.quiz.result.loaded'
          });
        } else {
          common.publishEvent({
            event_type: 'xblock.diagnostic_feedback.quiz.question.loaded',
            loaded_question: newIndex + 1
          });
        }
      }
      return status;

    }

    function resizeContentContainer() {
      // resize content container

      // for apros
      var target_height = 60;

      if($('.lesson-content').length == 0){
        // for lms
        target_height = 120;
      }

      var q_container = $(".question-container:visible .q-container");

      if(q_container.length == 0){
        //if final result
        target_height = $(".response_body").height() + target_height;
      } else {
        //if question
        target_height = q_container.height() + target_height;
      }

      $(".content").animate({height: target_height + "px"}, 500);
    }

    function updateResultHtml(event, currentIndex, newIndex) {
      //If the form is reloaded and the user have answered all the questions,
      //he will be showed the result and start over button.

      resizeContentContainer();
      if($(visibleAnswerChoice, element).find(selectedStudentChoice).val()){
           enableButton();
        }
      else{
          disableButton();
      }

      var isLast = (currentIndex == $(studentViewFormSecSelector, element).length - 1);
      if (isLast) {
        hideActions();
      }
    }

    function startOver(event) {
      //If user have answered all the questions, start over button shown to again start the Quiz
      studentQuiz.startOver = true;
      $(choiceSelector, element).find(choiceSelectedBtnSelector).removeAttr('checked');
      $form.children("div").steps("setStep", 0);
        disableButton();
    }


    function saveOrSkip(isLast, currentStep, currentIndex, newIndex) {
      common.clearErrors();

      // if start over button is click just return and do nothing
      if (studentQuiz.startOver) {

        studentQuiz.startOver = false;
        return startOverQuiz();

      } else if (studentQuiz.movingToStep) {
        studentQuiz.movingToStep = false;
        return true;

      } else {
        if (currentIndex > newIndex) {
          // allow to move backwards without validate & save
          common.publishEvent({
            event_type: 'xblock.diagnostic_feedback.quiz.question.reloading',
            reloading_question: newIndex
          });
          return true;
        }
        var selectedChoice = $(visibleAnswerChoice, element).find(selectedStudentChoice).val();

        if (selectedChoice != "" && selectedChoice != undefined) {
          return submitQuestionResponse(isLast, currentStep, newIndex);
        } else {
          common.showStudentValidationError({success: false, warning: false, msg: gettext('Please select an answer')});
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
      if (response.export_pending) {
        $exportProgress.html(gettext('The report is currently being generated…'));
        setTimeout(getStatus, 1000);
      } else {
        if(response.download_url){
          $exportProgress.html(gettext('Report is successfully generated. Downloading…'));
          window.location.href = response.download_url;
        } else {
          $exportProgress.html(gettext('Unable to generate report. Please contact your system administrator.'));
        }
      }
    }
      $(choiceSelectedBtnSelector).on('change', function() {
          if($(selectedStudentChoice).val()){
             enableButton();
          }
    });

    $(studentViewFormSelector, element).on('click', exportDataBtnSelector, function (eventObject) {
      eventObject.preventDefault();

      var link = $(eventObject.currentTarget);
      var handlerUrl = runtime.handlerUrl(element, 'start_export');

      $.ajax({
        type: 'POST',
        url: handlerUrl,
        data: JSON.stringify({}),
        success: updateStatus,
        error: function (response) {
          console.log(response);
        },
        dataType: 'json'
      });

    });

  });
}
