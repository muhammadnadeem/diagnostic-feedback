function StudioCommon(runtime, element) {
    var commonObj = this;
    var setting = new Setting();
    var common = new Common();

    commonObj.showQuizForm = function(){
        $('.wizard-loading').hide();
        $('#edit_questionnaire_panel').show();
    }

    commonObj.getQuizType = function() {
        var type = $("#type option:selected").val();
        if (!type) {
            type = $('input[name="type"]').val();
        }
        return type;
    }

    commonObj.scrollToBottom = function(){
        debugger
        var container = $('.wizard .content');
        var height = container[0].scrollHeight;
        container.scrollTop(height);
    }

    commonObj.closeModal = function(modal){
        modal.cancel();
    }

    commonObj.askCloseModal = function(modal){
        var r = confirm("Your data is successfully saved, Please click OK to close this window");
        if (r == true) {
            commonObj.closeModal(modal);
        }
    }

    commonObj.sumArray = function(_array){
        var total = 0;
        $.each(_array,function(j, value) {
            total += value;
        });
        return parseFloat(total.toFixed(1));
    }

    commonObj.getAllWQuestionsChoices = function(){
        var questionsChoices = [];
        $.each($('#questions_panel .question'), function (i, question) {
            var choices = [];
            $.each($(question).find('input[name*="]value["]'), function (j, choice) {
                choices.push(parseFloat($(choice).val()));
            });
            questionsChoices.push(choices);
        });
        return questionsChoices;
    }

    commonObj.allPossibleAnswers = function(arrayOfArrays) {
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
	}

    commonObj.getChoicesList = function() {
        // Get json values of categories added at step2

        var categories = [];
        $.each($("#categories_panel").find('.category'), function (i, category) {
            var id = $(category).find("input[name^='category[id]']").val();
            var name = $(category).find("input[name^='category[name]']").val();
            categories.push({id: id, name: name});
        });
        return categories;
    }

    commonObj.initiateHtmlEditor = function(container) {
        // Add tinymce text editor on textarea with class .custom_textarea in step 2

        if(setting.tinyMceAvailable){
            $.each(container.find('.custom_textarea'), function (i, textarea) {
                //check if a intance already exists for a textarea
                if ($(textarea).tinymce()) {
                    //remove existing attached intances with textarea
                    $(textarea).tinymce().destroy();
                }
                // initialize OR reinitialize tinymce on a textarea
                $(textarea).tinymce({
                    theme: 'modern',
                    skin: 'studio-tmce4',
                    height: '70px',
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
    }

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
    }

    commonObj.updateNextForm = function(step, previousStepData) {
        // Manipulate DOM of next step in wizard, based on the last step selections

        if (step == 1) {
            if (previousStepData.type == 'BFQ') {
                $('#categories_panel').removeClass('hide').addClass('show');
                $('#ranges_panel').removeClass('show').addClass('hide');
                commonObj.initiateHtmlEditor($('#categories_panel'));
            } else {
                $('#categories_panel').removeClass('show').addClass('hide');
                $('#ranges_panel').removeClass('hide').addClass('show');
                commonObj.initiateHtmlEditor($('#ranges_panel'));
            }
        } else if (step == 2) {
            var type = commonObj.getQuizType();
            if (type == 'BFQ') {
                var categories = previousStepData['categories'];
                commonObj.updateAllResultDropwdowns(categories);
                $('.answer-choice .answer-value').hide();
                $('.answer-choice .result-choice').show();

            } else {
                $('.answer-choice .result-choice').hide();
                $('.answer-choice .answer-value').show();
            }
        }
    }

    commonObj.updateUI = function(result) {
        // callback for ajax call that submit step data to server
        common.showMessage(result);
    }

    commonObj.updateFieldAttr = function(field, order) {
        // update the name/id of a single category/range filed

        var previous_name = field.attr('name').split("][")[0];
        var new_name = previous_name + "][" + order + "]";
        field.attr({name: new_name, id: new_name});
    }

    commonObj.updateQuestionFieldAttr = function(question, i){
        //Update name/id attributes of a given question-txt field
        $(question).find('.q-order').html(i + 1);
        var question_name = 'question[' + i + ']';
        $(question).find('.question-txt').first().attr({'name': question_name, id: question_name});
        //return question_name;
    }

    commonObj.updateChoiceFieldAttr = function(choice, i){
        //Update name/id attributes of a given choice field
        var question_name = $(choice).parent().prevAll('.question_field').find('.question-txt').first().attr('name');
        var ChoiceAnswer = question_name + 'answer[' + i + ']';
        var ChoiceValue = question_name + 'value[' + i + ']';

        $(choice).find("input[name*=answer]").attr({id: ChoiceAnswer, name: ChoiceAnswer});
        $(choice).find("input[name*=value]").attr({id: ChoiceValue, name: ChoiceValue});
    }

    commonObj.confirmAction = function(msg){
        //ask for confirmation of some action
        return confirm(msg);
    }

    commonObj.generateUniqueId = function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    commonObj.getCategoriesList = function(field_name) {
        // Get list of categories at step2
        return $('input[name^="' + field_name + '"]').map(function () {
            var order = $(this).attr('name').split('][')[1].replace(']', '');
            var id = $('input[name="category[id][' + order + ']"]').val();
            if(!id.trim()){
                id =  commonObj.generateUniqueId();
                $('input[name="category[id][' + order + ']"]').val(id);
            }
            var name = this.value;
            var image = $('input[name="category[image][' + order + ']"]').val();
            var htmlBody = $('textarea[name="category[html_body][' + order + ']"]').val();
            return {id: id, name: name, image: image, html_body: htmlBody};
        }).get();
    }

    commonObj.getRangesList = function(field_name) {
        // Get list of ranges at step2
        return $('input[name^="' + field_name + '"]').map(function () {
            var order = $(this).attr('name').split('][')[1].replace(']', '');
            var name = this.value;
            var minValue = $('input[name="range[min][' + order + ']"]').val();
            var maxValue = $('input[name="range[max][' + order + ']"]').val();
            var image = $('input[name="range[image][' + order + ']"]').val();
            var htmlBody = $('textarea[name="range[html_body][' + order + ']"]').val();
            return {name: name, min_value: minValue, max_value: maxValue, image: image, html_body: htmlBody};
        }).get();
    }

    commonObj.getStep1Data = function() {
        // Return first step data

        var type = commonObj.getQuizType();
        return {
            title: $('input[name="title"]').val(),
            description: $('textarea[name="description"]').val(),
            type: type
        }
    }

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

    }

    commonObj.getStep3Data = function() {
        // Get ste3 data before posting to server

        var questionContainers = $(".question");
        var questions = [];
        $.each(questionContainers, function (i, container) {
            var questionObj = {
                question_txt: $(container).find('.question-txt').val(),
                choices: []
            }

            var id = $(container).find('.question_id').first().val();
            if(!id.trim()){
                id =  commonObj.generateUniqueId();
                $(container).find('.question_id').first().val(id);
            }
            questionObj['id'] = id;

            var answerChoicesInputs = $(container).find('.answer-txt');
            $.each(answerChoicesInputs, function (j, choice) {
                var answerChoice = {
                    'choice_txt': $(choice).val(),
                    'choice_value': $(choice).nextAll('.answer-value').first().val(),
                    'choice_category': $(choice).nextAll('select:visible').val()
                };
                questionObj['choices'].push(answerChoice);
            });
            questions.push(questionObj);
        });
        return {'questions': questions};
    }

    commonObj.removeCategoryFromOptions = function(category){
        var category_id = category.find('input[name*="category[id]"]').val();
        $(".result-choice option[value='"+category_id+"']").remove();
    }

    commonObj.generateResultsHtml = function(dropdown, categories) {
        // generate html of category dropdown for step3

        var existing_values = [];
        $.each(dropdown.find('option'), function (i, option) {
            existing_values.push($(option).val());
        });

        var _html = '';
        $.each(categories, function (i, category) {
            var id = category.id;
            var name = category.name;

            if (existing_values.indexOf(id) < 0) {
                //append if option not exist
                _html += "<option value='" + id + "'>" + name + "</option>";
            } else {
                //update label of exiting option
                dropdown.find('option[value="'+id+'"]').html(name);
            }
        });

        return dropdown.html() + _html;
    }

    commonObj.updateAllResultDropwdowns = function(categories) {
        // update html of all results dropdowns to sync with categories/ranges added at step3

        var dropDowns = $(".result-choice");
        $.each(dropDowns, function (i, dropdown) {
            var mappingOptions = commonObj.generateResultsHtml($(dropdown), categories);
            $(dropdown).html(mappingOptions);
        });
    }


}