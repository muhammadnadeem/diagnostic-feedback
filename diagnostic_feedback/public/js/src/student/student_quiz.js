function StudentQuiz(runtime, element, initData) {
    "use strict";
    /* Javascript for Student view in LMS.*/

    var runtime = runtime,
        element = element;

    var studentQuiz = this;
    studentQuiz.startOver = false;
    studentQuiz.movingToStep = false;

    if (typeof gettext === "undefined") {
        window.gettext = function gettext_stub(string) {
            return string;
        };
        window.ngettext = function ngettext_stub(strA, strB, n) {
            return n === 1 ? strA : strB;
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
            studentViewForm = ".diagnostic-feedback.diagnostic-feedback-student",
            completedStepField = ".diagnostic-feedback .completed_step",
            nextAction = '.diagnostic-feedback ul[role="menu"] a[href*="next"]',
            previousAction = '.diagnostic-feedback ul[role="menu"] a[href*="previous"]',
            finishAction = '.diagnostic-feedback ul[role="menu"] a[href*="finish"]',
            cancelAction = '.diagnostic-feedback ul[role="menu"] a[href*="cancel"]',
            choiceSelectedBtn = "input[type='radio']",
            choiceDiv = '.diagnostic-feedback .answer-choice',
            visibleAnswerChoice = 'section.answer-choice.current',
            currentAnswerContainer = ".diagnostic-feedback .current",
            studentViewFormSection = ".diagnostic-feedback .student_view_form section",
            questionId = '.question-id',
            lessonContent = '.lesson-content',
            courseContent = '.course-content',
            contentPanel = ".content",
            questionContainer = '.q-container',
            quizQuestion = '.quiz-question',
            userAnswers = '.user-answers',
            selectedStudentChoice = 'input[type="radio"]:checked',
            exportDataBtn = ".export_data";

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
            $(nextAction + ', ' + previousAction + ', ' + finishAction, element).hide();
            $(cancelAction, element).show();
        }

        function resetActions() {
            // hide start over button
            // show next, previous, finish action button
            $(cancelAction, element).hide();
            disableNextButton();
            $(nextAction + ', ' + previousAction, element).show();
        }

        function disableNextButton() {
            $(nextAction, element).parent().addClass("disabled").attr("aria-" + "disabled", "true");
        }

        function enableNextButton() {
            $(nextAction, element).parent().removeClass("disabled").attr("aria-" + "disabled", "false");
        }

        function showResult(result) {
            // shows result of student
            var finalResultHtml = '<div class="html_body">' + result.html_body + '</div>';
            $(finalResult, element).html(finalResultHtml);
            common.publishEvent({
                event_type: 'xblock.diagnostic_feedback.quiz.result.generated',
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
            var choice = $('input[type="radio"][value="' + choice + '"]:visible', element),
                student_choice = choice.parent(userAnswers).find('label[for="' + choice.attr('id') + '"]').text(),
                question_txt = choice.parents(questionContainer).find(quizQuestion).text();

            return {'question_txt': question_txt, 'student_choice': student_choice};
        }

        function submitQuestionResponse(isLast, currentStep, newIndex) {
            // this method is called on valid submission and pass the student's selected value

            var answerHandlerUrl = runtime.handlerUrl(element, 'save_choice');
            var choice = getStudentChoice();
            choice['currentStep'] = currentStep;
            choice['isLast'] = isLast;  //if student given last answer of the question, this flag is true.

            $.ajax({
                type: "POST",
                url: answerHandlerUrl,
                data: JSON.stringify(choice),
                success: function (response) {
                    console.log(response);

                    var questionEventData = getQuestionEventData(choice.student_choice),
                        event_data = {
                            event_type: '',
                            question_txt: questionEventData.question_txt,
                            student_choice: questionEventData.student_choice,
                            current_question: currentStep,
                            is_last_question: isLast
                        };

                    if (response.success) {
                        //log event for question submission success
                        event_data.event_type = 'xblock.diagnostic_feedback.quiz.question.submitted';
                        common.publishEvent(event_data);

                        if (response.student_result) {
                            //log event for quiz finish
                            common.publishEvent({
                                event_type: 'xblock.diagnostic_feedback.quiz.finish',
                                quiz_type: initData.quiz_type,
                                quiz_title: initData.quiz_title,
                                current_question: currentStep
                            });
                            showResult(response.student_result);
                        }
                        studentQuiz.movingToStep = true;
                        $form.children("div").steps("setStep", newIndex);

                    } else {
                        //log event for quesiton submission error
                        event_data.event_type = 'xblock.diagnostic_feedback.quiz.question.submitError';
                        event_data.response_msg = response.response_msg;
                        common.publishEvent(event_data);
                    }
                }
            });
        }

        function startOverQuiz() {
            var startOverUrl = runtime.handlerUrl(element, 'start_over_quiz');
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
                data: JSON.stringify({}),
                success: function (response) {
                    if (response.success) {
                        $(choiceDiv, element).find(choiceSelectedBtn).removeAttr('checked');
                        resetActions();
                        event_data.event_type = 'xblock.diagnostic_feedback.quiz.startover.success';
                        studentQuiz.movingToStep = true;
                        $form.children("div").steps("setStep", 0);
                    } else {
                        event_data.event_type = 'xblock.diagnostic_feedback.quiz.startover.failed';
                    }
                    event_data.response_message = response.msg;
                    //log event for quiz start-over success/failure
                    common.publishEvent(event_data);
                }
            });
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

            var totalQuestions = $(questionContainer, element).length;
            var completedStep = parseInt($(completedStepField, element).val());

            if (completedStep === totalQuestions) {
                eventData.completed_questions = totalQuestions;
                // log event for result loading
                common.publishEvent({
                    event_type: 'xblock.diagnostic_feedback.quiz.result.reloading'
                });
            } else {
                eventData.completed_questions = completedStep;
                eventData.current_question = completedStep + 1;
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
            var btn = $(nextAction, element).parent();
            if (btn.hasClass('disabled') && newIndex > currentIndex) {
                return false;
            }
            var currentStep = currentIndex + 1;
            var isLast = (newIndex === $(studentViewFormSection, element).length - 1);

            var status = saveOrSkip(isLast, currentStep, currentIndex, newIndex);
            if (status) {
                if (isLast) {
                    common.publishEvent({
                        event_type: 'xblock.diagnostic_feedback.quiz.result.displayed'
                    });
                } else {
                    common.publishEvent({
                        event_type: 'xblock.diagnostic_feedback.quiz.question.displayed',
                        loaded_question: newIndex + 1
                    });
                }
            }
            return status;

        }

        function resizeContentContainer() {
            // resize content container

            // for lms
            var target_height = 60;

            if ($(courseContent).length === 0) {
                // for apros
                target_height = 30;
            }

            var q_container = $(".question-container:visible .q-container");

            if (q_container.length === 0) {
                //if final result
                target_height = $(finalResult, element).height() + target_height + 20;
            } else {
                //if question
                target_height = q_container.height() + target_height;
            }

            $(contentPanel, element).animate({height: target_height + "px"}, 500);
        }

        function updateResultHtml(event, currentIndex, newIndex) {
            //If the form is reloaded and the user have answered all the questions,
            //he will be showed the result and start over button.

            resizeContentContainer();
            if ($(visibleAnswerChoice, element).find(selectedStudentChoice).val()) {
                enableNextButton();
            } else {
                disableNextButton();
            }

            var isLast = (currentIndex === $(studentViewFormSection, element).length - 1);
            if (isLast) {
                hideActions();
            }
        }

        function startOver(event) {
            //If user have answered all the questions, start over button shown to again start the Quiz
            studentQuiz.startOver = true;
            changeStep(event, 0, 0);
        }


        function saveOrSkip(isLast, currentStep, currentIndex, newIndex) {
            // if start over button is click just return and do nothing
            if (studentQuiz.startOver) {

                studentQuiz.startOver = false;
                startOverQuiz();
                return false;

            } else if (studentQuiz.movingToStep) {
                studentQuiz.movingToStep = false;
                return true;

            } else {
                if (currentIndex > newIndex) {
                    // allow to move backwards without validate & save
                    common.publishEvent({
                        event_type: 'xblock.diagnostic_feedback.quiz.action.previous',
                        reloading_question: newIndex + 1
                    });
                    return true;
                }

                submitQuestionResponse(isLast, currentStep, newIndex);
                return false;
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
                if (response.download_url) {
                    $exportProgress.html(gettext('Report is successfully generated. Downloading…'));
                    window.location.href = response.download_url;
                } else {
                    $exportProgress.html(gettext('Unable to generate report. Please contact your system administrator.'));
                }
            }
        }

        $(choiceSelectedBtn).on('change', function () {
            if ($(selectedStudentChoice).val()) {
                enableNextButton();
            }
        });

        $(studentViewForm, element).on('click', exportDataBtn, function (eventObject) {
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
