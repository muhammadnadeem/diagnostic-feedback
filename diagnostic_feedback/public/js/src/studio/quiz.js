function Quiz(runtime, element, initData) {
    // contain js related to studio quiz wizard
    myXblock =this;
    xblockInitData = initData;

    $(function ($) {

        // import related js helpers
        var customValidator = new CustomValidator(),
        common = new Common(),
        studioCommon = new StudioCommon(),
        handler = new EventHandler(),
        setting = new Setting();

        // show quiz wizard html after popup loads its resources
        studioCommon.showQuizForm();

        //selectors
        var form = $("#questionnaire-form"),

        editQuestionPanel = "#edit_questionnaire_panel",
        categoriesPanel = '#categories_panel',
        addNewCategoryBtn = categoriesPanel+' .add-new-category',
        deleteCategoryBtn = '.delete-category',
        categorySelector = '.category',
        editorSelector = '.custom_textarea',

        rangesPanel = '#ranges_panel',
        addNewRangeBtn =  rangesPanel+' .add-new-range',
        deleteRangeBtn = '.delete-range',
        rangeSelector = '.range',

        step1Panel = "section[step='1']",
        step3Panel = "section[step='3']",
        questionPanel = '#questions_panel',
        addNewQuestionBtn = '.add-new-question',
        deleteQuestionBtn = '.delete-question',
        questionSelector = '.question',

        addNewChoiceBtn = '.add-new-choice',
        deleteChoiceBtn = '.delete-choice',
        choiceSelector = '.answer-choice',
        toolTipSelector = '.custom-tooltip';

        renderSteps();

        function renderSteps(){
            if (initData.quiz_type == initData.BUZ_FEED_QUIZ_VALUE){
                studioCommon.renderCategories();
            } else {
                studioCommon.renderRanges();
            }
            debugger;
            studioCommon.renderQuestions();

        }

        //initialize js validations if on in setting.js
        if(setting.jsValidation){
            // initialize jQuery validation on form
            form.validate({
                success: function (label, element) {
                    if ($(element).is("textarea")) {
                        $(element).prev(toolTipSelector).remove();
                    } else {
                        $(element).next(toolTipSelector).remove();
                    }
                },
                errorPlacement: function errorPlacement(error, element) {
                    var container = $('<div />');
                    container.addClass('custom-tooltip');

                    if (element.is("textarea")) {
                        error.insertAfter(element.prev());
                    } else {
                        error.insertAfter(element);
                    }

                    error.wrap(container);
                    $('<span class="feedback-symbol fa fa-warning"></span>').insertAfter(error);
                }
            });
        }

        function submitForm(currentStep) {
            // Send current step data to server for saving

            currentStep = parseInt(currentStep);
            var answerHandlerUrl = runtime.handlerUrl(element, 'save_data');

            var data = studioCommon.getStepData(currentStep);
            studioCommon.updateNextForm(currentStep, data);

            return $.ajax({
                async:false,
                type: "POST",
                url: answerHandlerUrl,
                data: JSON.stringify(data),
            });
        }

        function submitToSave(currentStep){
            var success = false;
            $.when(submitForm(currentStep)).done(function (response) {
                //runtime.refreshXBlock(element);
                if (response.success) {
                    success = true;

                    //close modal window if step3 saved successfully
                    if (response.step == 3) {
                        if(showInvalidChoiceValueWarning){
                            common.showMessage({
                                success: false,
                                warning: true,
                                persist: true,
                                msg: '<br />Your data has been successfully saved.<br />' +
                                'However, some answer combinations may not belong to any result.' +
                                '<a id="close_msg" href="#" style="float: right">Close</a>'
                            });
                            showInvalidChoiceValueWarning = false;
                        } else {
                            studioCommon.askCloseModal(runtime.modal);
                        }
                    }
                }

                if(response.step != 3 || (response.step == 3 && !response.success)){
                    common.showMessage(response);
                }
            });
            return success;
        }

        function validateAndSave(event, currentIndex, newIndex) {
            // send validated step data to server, this method will return true/false
            // if return true next stepp will be loaded
            // if return false validation errors will be shown

            var customValidated = false;
            tinyMCE.triggerSave();

            if (currentIndex > newIndex){
                // allow to move backwards without validate & save
                return true;
            } else {
                //validate and save data if moving next OR at last step
                var currentStep = currentIndex + 1;

                //execute both server side & js validations if on in setting.js
                if (setting.jsValidation) {
                    //ignore hidden fields; will validate on current step showing fields
                    //form.validate().settings.ignore = ":disabled,:hidden";
                    var fieldToIgnore = [
                        'section:visible .skip-validation',
                        'section:visible input:hidden',
                        'section:visible select:hidden',
                        'section:hidden input',
                        'section:hidden textarea',
                        'section:hidden select',
                    ]
                    form.validate().settings.ignore = fieldToIgnore.join(", ");

                    // run jquery.validate
                    // run extra validations if jquery vlidations are passed
                    var isValid = form.valid();
                    if (isValid){
                        customValidated = customValidator.customStepValidation(currentStep);
                    } else {
                        console.log(form.validate().errorList);
                    }

                    if (isValid && customValidated) {
                        //wait for ajax call response
                        return submitToSave(currentStep);
                    } else {
                        return false;
                    }

                } else {
                    // only server side validations will be applied
                    //wait for ajax call response
                    return submitToSave(currentStep);
                }
            }
        }

        // convert steps html to wizard, initial configurations
        form.children("div").steps({
            headerTag: "h3",
            bodyTag: "section",
            transitionEffect: "slideLeft",
            onStepChanging: validateAndSave,
            onFinishing: validateAndSave,
            labels: {
                cancel: "Cancel",
                current: "current step:",
                finish: "Save",
                next: "Next",
                previous: "Previous",
                loading: "Loading ..."
            }
        });

        $(addNewCategoryBtn, element).click(function (eventObject) {
            // get new category underscore template via ajax

            eventObject.preventDefault();
            var link = $(eventObject.currentTarget);
            handler.addNewCategory(link);
        });

        $(addNewRangeBtn, element).click(function (eventObject) {
            // get new range underscore template via ajax

            eventObject.preventDefault();
            var link = $(eventObject.currentTarget);
            handler.addNewRange(link);
        });

        $(questionPanel, element).on('click', addNewChoiceBtn, function (eventObject) {
            // get new choice underscore template via ajax

            eventObject.preventDefault();

            var link = $(eventObject.currentTarget);

            handler.addNewChoice(link);
        });

        $(step3Panel, element).on('click', addNewQuestionBtn, function (eventObject) {
            // get new question underscore template via ajax

            eventObject.preventDefault();

            var link = $(eventObject.currentTarget);

            handler.addNewQuestion(link);

        });

        $(categoriesPanel, element).on('click', deleteCategoryBtn, function(eventObject){
            // delete some category

            eventObject.preventDefault();

            var btn = $(eventObject.currentTarget);
            var categories_container = $(btn).parents(categoriesPanel).first();

            if(categories_container.find(categorySelector).length == 1){
                // show waring if trying to delete last category
                common.showMessage({success: false, warning:true, msg: 'At least one category is required'}, categories_container.find(categorySelector));
            } else {
                // ask for confirmation before delete action
                if (studioCommon.confirmAction('Are you sure to delete this category?')) {
                    var category = $(btn).parent(categorySelector);

                    //remove deleted category html at step3 from all category selection dropdowns
                    studioCommon.removeCategoryFromOptions(category);

                    studioCommon.destroyEditor($(category).find('textarea'));

                    //remove category html from DOM at current step
                    category.remove();

                    // rename all remaining categories fields attrs
                    var remaining_categories = categories_container.find(categorySelector);
                    $.each(remaining_categories, function (i, category) {
                        var fields = $(category).find('input[type="text"], input[type="hidden"], textarea');
                        $.each(fields, function (k, field) {
                            studioCommon.destroyEditor(field);
                            studioCommon.updateFieldAttr($(field), i);
                        });
                    });

                    // re-attache text editor after field renaming
                    studioCommon.initiateHtmlEditor($(categoriesPanel));
                }
            }
        });

        $(rangesPanel, element).on('click', deleteRangeBtn, function(eventObject){
            // delete existing range
            eventObject.preventDefault();

            var btn = $(eventObject.currentTarget);
            var ranges_container = $(btn).parents(rangesPanel).first();

            if(ranges_container.find(rangeSelector).length == 1){
                //show waring if tring to delete last range
                common.showMessage({success: false, warning:true, msg: 'At least one range is required'}, ranges_container.find(rangeSelector));
            } else {
                // ask for confirmation before delete action
                if (studioCommon.confirmAction('Are you sure to delete this range?')) {
                    var range = $(btn).parent(rangeSelector);
                    studioCommon.destroyEditor($(range).find('textarea'));
                    range.remove();

                    var remaining_ranges = ranges_container.find(rangeSelector);
                    $.each(remaining_ranges, function (i, range) {
                        var fields = $(range).find('input[type="text"], input[type="number"], input[type="hidden"], textarea');
                        $.each(fields, function (k, field) {
                            studioCommon.destroyEditor($(field).find('textarea'));
                            studioCommon.updateFieldAttr($(field), i);
                        });
                    });

                    // re-attache text editor after field renaming
                    studioCommon.initiateHtmlEditor($(rangesPanel));
                }
            }
        });

        $(questionPanel, element).on('click', deleteQuestionBtn, function(eventObject){
            // delete question
            eventObject.preventDefault();

            var btn = $(eventObject.currentTarget);
            var questions_container = $(btn).parents(questionPanel).first();

            if(questions_container.find(questionSelector).length == 1){
                //show waning if tring to delete last question
                common.showMessage({success: false, warning:true, msg: 'At least one question is required'}, questions_container.find(questionSelector));
            } else {
                //ask for confirmation before delete action
                if (studioCommon.confirmAction('Are you sure to delete this question?')) {
                    var question = $(btn).parents(questionSelector);

                    studioCommon.destroyEditor($(question).find(editorSelector));

                    //remove question html from DOM
                    question.remove();

                    // rename all remaining question fields including its choice
                    var remaining_questions = questions_container.find(questionSelector);
                    $.each(remaining_questions, function (i, question) {

                        studioCommon.destroyEditor($(question).find(editorSelector));
                        studioCommon.updateQuestionFieldAttr(question, i);
                        var question_choices = $(question).find(choiceSelector);
                        $.each(question_choices, function (j, choice) {
                            studioCommon.updateChoiceFieldAttr(choice, j);
                        });
                    });

                    studioCommon.initiateHtmlEditor($(questionPanel));
                }
            }
        });

        $(questionPanel, element).on('click', deleteChoiceBtn, function(eventObject){
            // delete question choice

            eventObject.preventDefault();

            var btn = $(eventObject.currentTarget);
            var answers_container = $(btn).parents(questionSelector).first();

            if(answers_container.find(choiceSelector).length == 1){
                //show warning if trying to delete last choice
                common.showMessage({success: false, warning:true, msg: 'At least one answer is required'}, answers_container);
            } else {
                //ask for confirmation before delete action
                if (studioCommon.confirmAction('Are you sure to delete this choice?')){
                    //remove choice html from DOM
                    $(btn).parent(choiceSelector).remove();

                    // rename all remaining choices fields of specific question
                    var remaining_choices = answers_container.find(choiceSelector);
                    $.each(remaining_choices, function (j, choice) {
                        studioCommon.updateChoiceFieldAttr(choice, j);
                    });
                }
            }
        });

        $(questionPanel, element).on('change', 'select', function(eventObject) {
            // add attribute selected='select' on selection option
            var select = $(eventObject.currentTarget).find("option:selected");
            select.attr({'selected': 'selected'});
        });

        $(editQuestionPanel, element).on('click', '#close_msg', function(eventObject) {
            eventObject.preventDefault();

            var btn = $(eventObject.currentTarget);
            var msgDiv = btn.parents('.msg');
            btn.parents("h3").first().html("");
            msgDiv.slideUp('slow');
        });

        studioCommon.initiateHtmlEditor($(step1Panel), true);

    });
}
