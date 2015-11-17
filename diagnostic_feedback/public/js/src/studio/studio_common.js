function StudioCommon(runtime, element) {
    var commonObj = this,
        setting = new Setting(),

        //selectors
        quizTypeSelector = ".diagnostic-feedback #type option:selected",
        //quizTypeInputSelector = ".diagnostic-feedback input[name='type']",
        loadingDiv = '.diagnostic-feedback .wizard-loading',
        editQuizPanel = '.diagnostic-feedback #edit_questionnaire_panel',

        quizTitleSelector = '.diagnostic-feedback input[name="title"]',
        quizDescriptionSelector = '.diagnostic-feedback textarea[name="description"]',

        questionPanel = '.diagnostic-feedback #questions_panel',
        questionSelector = '.question',
        questionOrderSelector = '.q-order',
        questionIdSelector = '.question-id',
        questionFieldsContainerSelector = '.question-field',
        questionTxtFieldSelector = '.question-txt',
        questionTitleFieldSelector = '.question-title',
        addQuestionSelector = '.add-new-question',

        categoriesPanel = ".diagnostic-feedback #categories_panel",
        categorySelector = '.category',
        categoryIdSelector = 'input[name*="category[id]"]',
        categoryNameSelector = "input[name^='category[name]']",
        addNewCategorySelector = '.add-new-category',
        tinyMceTextarea = '.custom-textarea',

        rangesPanel = '.diagnostic-feedback #ranges_panel',
        addNewRangeBtnSelector = '.add-new-range',

        allChoiceValuesInputs = '.diagnostic-feedback .answer-choice .answer-value',
        allResultChoicesDropdowns = '.diagnostic-feedback .answer-choice .result-choice',
        choiceValueSelector = 'input[name*="]value["]',
        choiceValueClsSelector = '.answer-value',
        choiceNameSelector = 'input[name*=answer]',
        choiceResultSelector = '.result-choice:visible',
        allResultChoiceSelector = '.diagnostic-feedback .result-choice',
        choiceNameClsSelector = '.answer-txt';


    commonObj.showQuizForm = function(){
        // show quiz wizard html after popup resources loading
        $(loadingDiv).hide();
        $(editQuizPanel).show();
    };

    commonObj.getQuizType = function() {
        // get type of quiz from DOM

        return $(quizTypeSelector).val();
        //if (!type) {
        //    type = $(quizTypeInputSelector).val();
        //}
        //return type;
    };

    commonObj.closeModal = function(modal){
        // close studio edit popup

        modal.cancel();
        location.reload();
    };

    commonObj.askCloseModal = function(modal){
        // ask form confirmation before closing studio edit popup (after step 3 saved)

        var r = confirm("Your data is successfully saved, Please click OK to close this window");
        if (r == true) {
            commonObj.closeModal(modal);
        }
    };

    commonObj.sumArray = function(_array){
        // return sum of an array

        var total = 0;
        $.each(_array, function(j, value) {
            total += value;
        });
        return parseFloat(total.toFixed(1));
    };

    commonObj.getAllWQuestionsChoices = function(){
        // return array of array for all choices values of all questions

        var questionsChoices = [];
        $.each($(questionPanel + ' ' + questionSelector), function (i, question) {
            var choices = [];
            $.each($(question).find(choiceValueSelector), function (j, choice) {
                choices.push(parseFloat($(choice).val()));
            });
            questionsChoices.push(choices);
        });
        return questionsChoices;
    };

    commonObj.allPossibleAnswers = function(arrayOfArrays) {
        // return all possible answers combination for all questions of a quiz

		if (Object.prototype.toString.call(arrayOfArrays) !== '[object Array]') {
			throw new Error("combinations method was passed a non-array argument");
		}

		var combinations = [],
			comboKeys = [],
			numOfCombos = arrayOfArrays.length ? 1 : 0,
			arrayOfArraysLength = arrayOfArrays.length;

		for(var n = 0; n < arrayOfArraysLength; ++n) {
			if(Object.prototype.toString.call(arrayOfArrays[n]) !== '[object Array]') {
				throw new Error("combinations method was passed a non-array argument");
			}
			numOfCombos = numOfCombos*arrayOfArrays[n].length;
		}

		for(var x = 0; x < numOfCombos; ++x) {
			var carry = x,
				comboKeys = [],
				combo = [];

			for(var i = 0; i < arrayOfArraysLength; ++i) {
				comboKeys[i] = carry % arrayOfArrays[i].length;
				carry = Math.floor(carry / arrayOfArrays[i].length);
			}
			for(var i = 0; i < comboKeys.length; ++i) {
				combo.push(arrayOfArrays[i][comboKeys[i]]);
			}
			combinations.push({'combination': combo, 'sum': commonObj.sumArray(combo)});
		}

		return combinations;
	};

    commonObj.getChoicesList = function() {
        // Get array of values for categories added at step2

        var categories = [];
        $.each($(categoriesPanel).find(categorySelector), function (i, category) {
            var id = $(category).find(categoryIdSelector).val();
            var name = $(category).find(categoryNameSelector).val();
            categories.push({id: id, name: name});
        });
        return categories;
    };

    commonObj.destroyEditor = function(editor){
        //check if an intance already attached with any textarea
        if ($(editor).tinymce()) {
            //remove existing attached instances
            $(editor).tinymce().destroy();
        }
    };

    commonObj.initiateHtmlEditor = function(container, destroyExisting, width, height) {
        // Add tinymce text editor on textarea with class .custom-textarea at step 2

        destroyExisting = typeof destroyExisting !== 'undefined' ? destroyExisting : false;
        width = typeof width !== 'undefined' ? width : '100%';
        height = typeof height !== 'undefined' ? height : '70px';

        if(setting.tinyMceAvailable){
            $.each(container.find(tinyMceTextarea), function (i, textarea) {
                if(destroyExisting){
                    commonObj.destroyEditor(textarea);
                }

                // initialize tinymce on a textarea
                $(textarea).tinymce({
                    theme: 'modern',
                    skin: 'studio-tmce4',
                    height: height,
                    width: width,
                    formats: {code: {inline: 'code'}},
                    codemirror: {path: "" + baseUrl + "/js/vendor"},
                    convert_urls: false,
                    plugins: "link codemirror",
                    menubar: false,
                    statusbar: false,
                    toolbar_items_size: 'small',
                    toolbar: "formatselect | styleselect | bold italic underline forecolor wrapAsCode | bullist numlist outdent indent blockquote | link unlink | code",
                    resize: "both"
                });
            });
        }
    };

    commonObj.getStepData = function(step) {
        // Get data of a given step before sending to server

        var data = {step: step};
        var stepData = {};
        if (step == 1) {
            stepData = commonObj.getStep1Data();
        } else if (step == 2) {
            stepData = commonObj.getStep2Data();
        } else if (step == 3) {
            stepData = commonObj.getStep3Data();
        }
        data = $.extend(data, stepData);
        console.log(data);

        return data;
    };

    commonObj.updateAllResultDropwdowns = function(categories) {
        // update html of all results dropdowns to sync with categories added at step2

        //var dropDowns = $(".result-choice");
        var dropDowns = $(allResultChoicesDropdowns);
        $.each(dropDowns, function (i, dropdown) {
            var mappingOptions = commonObj.generateResultsHtml($(dropdown), categories);
            $(dropdown).html(mappingOptions);
        });
    };

    commonObj.generateResultsHtml = function(dropdown, categories) {
        // generate html of result dropdown at step3

        // get all existing values in dropdown
        var existingValues = [];
        $.each(dropdown.find('option'), function (i, option) {
            existingValues.push($(option).val());
        });

        // skip already added categories and append only newly added category/categories as result
        var _html = '';
        $.each(categories, function (i, category) {
            var id = category.id;
            var name = category.name;

            if (existingValues.indexOf(id) < 0) {
                //append if option not exist
                _html += "<option value='" + id + "'>" + name + "</option>";
            } else {
                //just update label of exiting option
                dropdown.find('option[value="'+id+'"]').html(name);
            }
        });

        return dropdown.html() + _html;
    };

    commonObj.updateNextForm = function(step, previousStepData) {
        // Manipulate DOM of next step in wizard, based on the last step selections

        var quizType = commonObj.getQuizType();
        if (step == 1) {
            // for 2nd step of wizard
            if (quizType == 'BFQ') {
                // in case of quiz type is BuzFeed
                // show categories html
                // hide ranges html
                // initialize tinymce text editor on textarea in categories_panel

                //if (xblockInitData.quiz_type == "") {
                //    commonObj.renderCategories();
                //}

                $(categoriesPanel).removeClass('hide').addClass('show');
                $(rangesPanel).removeClass('show').addClass('hide');
                commonObj.initiateHtmlEditor($(categoriesPanel), true);
            } else {
                // in case of quiz type is Diagnostic
                // show ranges html
                // hide categories html
                // initialize tinymce text editor on textarea in ranges_panel

                $(categoriesPanel).removeClass('show').addClass('hide');
                $(rangesPanel).removeClass('hide').addClass('show');
                commonObj.initiateHtmlEditor($(rangesPanel), true);
            }
        } else if (step == 2) {
            // for 3rd step of wizard
            if (quizType == 'BFQ') {
                // in case quiz type is Buzfeed
                // fill all results dropdown with categories selected at step 2
                // hide range related inputs and show result dropdowns
                var categories = previousStepData['categories'];
                commonObj.updateAllResultDropwdowns(categories);
                $(allChoiceValuesInputs).hide();
                $(allResultChoicesDropdowns).show();

            } else {
                // in case quiz type is diagnostic
                // hide all results dropdowns and sow range related inputs
                $(allResultChoicesDropdowns).hide();
                $(allChoiceValuesInputs).show();
            }
            commonObj.initiateHtmlEditor($(questionPanel), true);
        }
    };

    commonObj.updateFieldAttr = function(field, order) {
        // update the name/id of a single category/range filed

        var previousName = field.attr('name').split("][")[0];
        var newName = previousName + "][" + order + "]";
        field.attr({name: newName, id: newName});
    };

    commonObj.updateQuestionFieldAttr = function(question, i){
        //Update name/id attributes of a given question-txt field

        $(question).find(questionOrderSelector).html(i + 1);
        var questionTitle = 'question[' + i + '][title]';
        var questionText = 'question[' + i + '][text]';
        $(question).find(questionTitleFieldSelector).first().attr({'name': questionTitle, id: questionTitle});
        $(question).find(questionTxtFieldSelector).first().attr({'name': questionText, id: questionText});
    };

    commonObj.updateChoiceFieldAttr = function(choice, i){
        //Update name/id attributes of a given choice field
        var questionName = $(choice).parent().prevAll(questionFieldsContainerSelector).find(questionTxtFieldSelector).first().attr('name').split("][")[0]+ "]";
        var ChoiceAnswer = questionName + 'answer[' + i + ']';
        var ChoiceValue = questionName + 'value[' + i + ']';
        var CategoryValue = questionName + 'category[' + i + ']';

        $(choice).find(choiceNameSelector).attr({id: ChoiceAnswer, name: ChoiceAnswer});
        $(choice).find(choiceResultSelector).attr({id: CategoryValue, name: CategoryValue});
        $(choice).find(choiceValueSelector).attr({id: ChoiceValue, name: ChoiceValue});
    };

    commonObj.confirmAction = function(msg){
        //ask for confirmation of some action
        return confirm(msg);
    };

    commonObj.generateUniqueId = function(){
        // return unique id for category/question
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

    commonObj.getCategoriesList = function(fieldName) {
        // Get list of categories at step2
        return $('input[name^="' + fieldName + '"]').map(function () {
            var order = $(this).attr('name').split('][')[1].replace(']', ''),
                id = $('input[name="category[id][' + order + ']"]').val();

            if(!id){
                id =  commonObj.generateUniqueId();
                $('input[name="category[id][' + order + ']"]').val(id);
            }

            var name = this.value,
            image = $('input[name="category[image][' + order + ']"]').val(),
            internalDescription = $('input[name="category[internal_description][' + order + ']"]').val(),
            htmlBody = $('textarea[name="category[html_body][' + order + ']"]').val();

            return {id: id, name: name, image: image, internal_description: internalDescription, html_body: htmlBody};
        }).get();
    };

    commonObj.getRangesList = function(fieldName) {
        // Get list of ranges at step2
        return $('input[name^="' + fieldName + '"]').map(function () {
            var order = $(this).attr('name').split('][')[1].replace(']', ''),
                name = this.value,
                minValue = $('input[name="range[min][' + order + ']"]').val(),
                maxValue = $('input[name="range[max][' + order + ']"]').val(),
                image = $('input[name="range[image][' + order + ']"]').val(),
                internalDescription = $('input[name="range[internal_description][' + order + ']"]').val(),
                htmlBody = $('textarea[name="range[html_body][' + order + ']"]').val();

            return {name: name, min_value: minValue, max_value: maxValue, image: image,
                internal_description: internalDescription, html_body: htmlBody};
        }).get();
    };

    commonObj.getStep1Data = function() {
        // Return first step data
        var type = commonObj.getQuizType();
        return {
            title: $(quizTitleSelector).val(),
            description: $(quizDescriptionSelector).val(),
            type: type
        }
    };

    commonObj.getStep2Data = function() {
        // Get data of step2

        var type = commonObj.getQuizType();
        if (type == 'BFQ') {
            return {
                'categories': commonObj.getCategoriesList('category[name]')
            }
        } else {
            return {
                'ranges': commonObj.getRangesList('range[name]')
            }
        }

    };

    commonObj.getStep3Data = function() {
        // Get step3 data before posting to server

        var questionContainers = $(questionPanel+ " " +questionSelector);
        var questions = [];
        $.each(questionContainers, function (i, container) {
            var questionObj = {
                question_title: $(container).find(questionTitleFieldSelector).val(),
                question_txt: $(container).find(questionTxtFieldSelector).val(),
                choices: []
            };

            var id = $(container).find(questionIdSelector).first().val();
            if(!id){
                id =  commonObj.generateUniqueId();
                $(container).find(questionIdSelector).first().val(id);
            }
            questionObj['id'] = id;

            var answerChoicesInputs = $(container).find(choiceNameClsSelector);
            $.each(answerChoicesInputs, function (j, choice) {
                var answerChoice = {
                    'choice_txt': $(choice).val(),
                    'choice_value': $(choice).nextAll(choiceValueClsSelector).first().val(),
                    'choice_category': $(choice).nextAll(choiceResultSelector).val()
                };
                questionObj['choices'].push(answerChoice);
            });
            questions.push(questionObj);
        });
        return {'questions': questions};
    };

    commonObj.removeCategoryFromOptions = function(category){
        // remove category option from all result dropdowns at step 3
        var categoryId = category.find(categoryIdSelector).val();

        $(allResultChoiceSelector + " option[value='" + categoryId + "']").remove();
    };


    commonObj.renderSingleCategory = function(order, category){
        //Render html for a single category

        if(typeof category == 'undefined') {
            category = {id: '', name: '', image: '', internal_description: '', html_body: ''};
        }

        if(typeof category.id == 'undefined') {
            category['id'] = '';
        }

        category['order'] = order;

        var tpl = _.template(xblockInitData.categoryTpl),
            html = tpl(category);

        $(html).insertBefore($(categoriesPanel).find(addNewCategorySelector));
    };

    commonObj.renderSingleRange = function(order, range){
        //Render html for a single range

        if (typeof range == 'undefined') {
            range = { name: '', min_value: '', max_value: '', image: '', internal_description: '', html_body: ''};
        }

        range['order'] = order;

        var tpl = _.template(xblockInitData.rangeTpl),
            html = tpl(range);

        $(html).insertBefore($(rangesPanel).find(addNewRangeBtnSelector));
    };


    commonObj.renderSingleChoice = function(qOrder, cOrder, choice, returnChoiceObj){
        //Render html for a single choice

        var quizType = commonObj.getQuizType();
        var returnChoiceObj = typeof returnChoiceObj !== 'undefined' ? returnChoiceObj : false;

        if(typeof choice == 'undefined') {
            choice = {name: '', value: '', category_id: '' };
        }

        choice['q_order'] = qOrder;
        choice['c_order'] = cOrder;
        choice['resultChoicesOptions'] = commonObj.getChoicesList();
        choice['quiz_type'] = quizType;
        choice['BUZ_FEED_QUIZ_VALUE'] = xblockInitData.BUZ_FEED_QUIZ_VALUE;

        if(returnChoiceObj){
            return choice;
        } else {
            var tpl = _.template(xblockInitData.choiceTpl),
            html = tpl(choice);

            return html;
        }
    };

    commonObj.renderSingleQuestion = function(order, question){
        //Render html for a single question

        if(typeof question == 'undefined') {
            question = {
                id: '',
                title: '',
                text: '',
                choices: []
            }
        }

        question['order'] = order;

        // Render if questiong already have choices
        if(question.choices.length > 0) {
            // Render all existing choices
            var choices = [];
            $.each(question.choices, function (cOrder, choice) {
                choices.push(commonObj.renderSingleChoice(order, cOrder, choice, true));
            });
            question['choices'] = choices;
        } else {
            // Render new empty choice
            question['choices'] = [commonObj.renderSingleChoice(order, 0, undefined, true)];
        }

        var tpl = _.template(xblockInitData.questionTpl),
            html = tpl(question);

        $(html).insertBefore($(questionPanel).find(addQuestionSelector));
    };


    commonObj.renderCategories = function(){
        //Render all categories html

        if(xblockInitData.results.length > 0){
            // Render all existing categories
            $.each(xblockInitData.results, function(order, catergory){
                commonObj.renderSingleCategory(order, catergory);
            });
        } else {
            // Render new category html
            commonObj.renderSingleCategory(0);
        }
    };

    commonObj.renderRanges = function(){
        //Render all ranges html

        if(xblockInitData.results.length > 0){
            // Render all existing ranges
            $.each(xblockInitData.results, function(order, range){
                commonObj.renderSingleRange(order, range);
            });
        } else {
            // Render new range html
            commonObj.renderSingleRange(0);
        }
    };

    commonObj.renderQuestions = function(){
        //Render all questions html

        if(xblockInitData.questions.length > 0){
            // Render all existing questions
            $.each(xblockInitData.questions, function(order, question){
                commonObj.renderSingleQuestion(order, question);
            });
        } else {
            // Render new question html
            commonObj.renderSingleQuestion(0);
        }
    };

}