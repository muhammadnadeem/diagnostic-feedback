function Quiz(runtime, element) {
    // contain js related to studio quiz wizard
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

        categoriesPanel = '#categories_panel',
        addNewCategoryBtn = categoriesPanel+' .add-new-category',
        deleteCategoryBtn = '.delete-category',
        categorySelector = '.category',

        rangesPanel = '#ranges_panel',
        addNewRangeBtn =  rangesPanel+' .add-new-range',
        deleteRangeBtn = '.delete-range',
        rangeSelector = '.range',

        step3Panel = "section[step='3']",
        questionPanel = '#questions_panel',
        addNewQuestionBtn = '.add-new-question',
        deleteQuestionBtn = '.delete-question',
        questionSelector = '.question',

        addNewChoiceBtn = '.add-new-choice',
        deleteChoiceBtn = '.delete-choice',
        choiceSelector = '.answer-choice';

        //initialize js validations if on in setting.js
        if(setting.jsValidation){
            // initialize jQuery validation on form
            form.validate({
                errorPlacement: function errorPlacement(error, element) {
                    element.after(error);
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

        function saveToServer(event, currentIndex, newIndex) {
            // send validated step data to server, this method will return true/false
            // if return true next stepp will be loaded
            // if return false validation errors will be shown

            var customValidated = false;

            if (currentIndex > newIndex){
                // allow to move backwards without validate & save
                return true;
            } else {
                //validate and save data if moving next OR at last step
                var currentStep = currentIndex + 1;

                //execute both server side & js validations if on in setting.js
                if (setting.jsValidation) {
                    //ignore hidden fields; will validate on current step showing fields
                    form.validate().settings.ignore = ":disabled,:hidden";


                    // run jquery.validate
                    var isValid = form.valid();

                    // run extra validations if jquery vlidations are passed
                    if (isValid){
                        console.log('executing additional validations');
                        customValidated = customValidator.customStepValidation(currentStep);
                    }


                    if (isValid && customValidated) {
                        //wait for ajax call response
                        var success = false;
                        $.when(submitForm(currentStep)).done(function (response) {
                            //studioCommon.updateUI(response);
                            common.showMessage(response);
                            if (response.success) {
                                success = true;

                                //close modal window if step3 saved successfully
                                if (response.step == 3) {
                                    studioCommon.askCloseModal(runtime.modal);
                                }
                            }
                        });
                        return success;

                    } else {
                        return false;
                    }

                } else {
                    // only server side validations will be applied
                    //wait for ajax call response
                    var success = false;
                    $.when(submitForm(currentStep)).done(function (response) {
                        if (response.success) {
                            success = true;
                        }
                        //studioCommon.updateUI(response);
                        common.showMessage(response);
                    });
                    return success;
                }
            }
        }

        // convert steps html to wizard, initial configurations
        form.children("div").steps({
            headerTag: "h3",
            bodyTag: "section",
            transitionEffect: "slideLeft",
            onStepChanging: saveToServer,
            onFinishing: saveToServer,
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
            var categoryTemplateHandlerUrl = runtime.handlerUrl(element, 'get_template');

            $.ajax({
                type: "POST",
                data: JSON.stringify({type: 'category'}),
                url: categoryTemplateHandlerUrl,
                async: false,
                dataType: 'html',
                success: function (result) {
                    handler.addNewCategory(link, result);
                }
            });
        });

        $(addNewRangeBtn, element).click(function (eventObject) {
            // get new range underscore template via ajax

            eventObject.preventDefault();

            var link = $(eventObject.currentTarget);
            var categoryTemplateHandlerUrl = runtime.handlerUrl(element, 'get_template');

            $.ajax({
                type: "POST",
                data: JSON.stringify({type: 'range'}),
                url: categoryTemplateHandlerUrl,
                async: false,
                dataType: 'html',
                success: function (result) {
                    handler.addNewRange(link, result);
                }
            });
        });

        $(questionPanel, element).on('click', addNewChoiceBtn, function (eventObject) {
            // get new choice underscore template via ajax

            eventObject.preventDefault();

            var link = $(eventObject.currentTarget);
            var questionTemplateHandlerUrl = runtime.handlerUrl(element, 'get_template');

            $.ajax({
                type: "POST",
                data: JSON.stringify({type: 'choice'}),
                url: questionTemplateHandlerUrl,
                async: false,
                dataType: 'html',
                success: function (result) {
                    handler.addNewChoice(link, result);
                }
            });
        });

        $(step3Panel, element).on('click', addNewQuestionBtn, function (eventObject) {
            // get new question underscore template via ajax

            eventObject.preventDefault();

            var link = $(eventObject.currentTarget);
            var questionTemplateHandlerUrl = runtime.handlerUrl(element, 'get_template');

            $.ajax({
                type: "POST",
                data: JSON.stringify({type: 'question'}),
                url: questionTemplateHandlerUrl,
                async: false,
                dataType: 'html',
                success: function (result) {
                    handler.addNewQuestion(link, result);
                }
            });

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

                    //remove category html from DOM at current step
                    category.remove();

                    // rename all remaining categories fields attrs
                    var remaining_categories = categories_container.find(categorySelector);
                    $.each(remaining_categories, function (i, category) {
                        var fields = $(category).find('input[type="text"], input[type="hidden"], textarea');
                        $.each(fields, function (k, field) {
                            studioCommon.updateFieldAttr($(field), i);
                        });
                    });
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
                    $(btn).parent(rangeSelector).remove();

                    var remaining_ranges = ranges_container.find(rangeSelector);
                    $.each(remaining_ranges, function (i, range) {
                        var fields = $(range).find('input[type="text"], input[type="number"], input[type="hidden"], textarea');
                        $.each(fields, function (k, field) {
                            studioCommon.updateFieldAttr($(field), i);
                        });
                    });
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
                    //remove question html from DOM
                    $(btn).parents(questionSelector).remove();

                    // rename all remaining question fields including its choice
                    var remaining_questions = questions_container.find(questionSelector);
                    $.each(remaining_questions, function (i, question) {
                        //var question_name = studioCommon.updateQuestionFieldAttr(question, i);
                        studioCommon.updateQuestionFieldAttr(question, i);
                        var question_choices = $(question).find(choiceSelector);
                        $.each(question_choices, function (j, choice) {
                            studioCommon.updateChoiceFieldAttr(choice, j);
                        });
                    });
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
    });
}
