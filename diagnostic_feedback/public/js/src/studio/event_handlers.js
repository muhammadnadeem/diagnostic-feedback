function EventHandler(runtime, element){
    var handler = this,
        studioCommon = new StudioCommon(),
        questionPanel = '#questions_panel',
        categoriesPanel = '#categories_panel',
        rangesPanel = '#ranges_panel',
        rangeSelector = '.range',
        questionSelector = '.question',
        questionFieldSelector = '.question_field',
        choiceSelector = '.answer-choice',
        categorySelector = '.category',
        questionTextSelector = '.question-txt';


    handler.addNewCategory = function(link, result) {
        // Handler to add new category on step2

        var link = $(link),
            template = JSON.parse(result).template,
            tmpl = _.template(template),

            existing_categories = link.prevAll(categorySelector).length,
            idFieldAttrs = 'category[id][' + existing_categories + ']',
            nameFieldAttrs = 'category[name][' + existing_categories + ']',
            imageFieldAttrs = 'category[image][' + existing_categories + ']',
            internalDescAttrs = 'category[internal_description][' + existing_categories + ']',
            htmlBodyFieldAttrs = 'category[html_body][' + existing_categories + ']',
            html = tmpl({
                idFieldAttrs: idFieldAttrs,
                nameFieldAttrs: nameFieldAttrs,
                imageFieldAttrs: imageFieldAttrs,
                internalDescAttrs: internalDescAttrs,
                htmlBodyFieldAttrs: htmlBodyFieldAttrs
            });

        $(html).insertBefore(link);
        studioCommon.initiateHtmlEditor($(categoriesPanel));
    };

    handler.addNewRange = function(link, result) {
        // Handler to add new range on step2

        var link = $(link),
            template = JSON.parse(result).template,
            tmpl = _.template(template),

            existing_ranges = link.prevAll(rangeSelector).length,
            idFieldAttrs = 'range[id][' + existing_ranges + ']',
            nameFieldAttrs = 'range[name][' + existing_ranges + ']',
            minFieldAttrs = 'range[min][' + existing_ranges + ']',
            maxFieldAttrs = 'range[max][' + existing_ranges + ']',
            imageFieldAttrs = 'range[image][' + existing_ranges + ']',
            internalDescAttrs = 'range[internal_description][' + existing_ranges + ']',
            htmlBodyFieldAttrs = 'range[html_body][' + existing_ranges + ']',
            html = tmpl({
                idFieldAttrs: idFieldAttrs,
                nameFieldAttrs: nameFieldAttrs,
                minFieldAttrs: minFieldAttrs,
                maxFieldAttrs: maxFieldAttrs,
                imageFieldAttrs: imageFieldAttrs,
                internalDescAttrs: internalDescAttrs,
                htmlBodyFieldAttrs: htmlBodyFieldAttrs
            });

        $(html).insertBefore(link);
        studioCommon.initiateHtmlEditor($(rangesPanel));
        //studioCommon.scrollToBottom();
    };

    handler.addNewQuestion = function(link, result) {
        // Handler to add new question html

        var link = $(link),
            type = studioCommon.getQuizType(),

            template = JSON.parse(result).template,
            tmpl = _.template(template),

            // count existing questions
            existing_questions = link.prevAll(questionSelector).length,
            questionTitle = 'question[' + existing_questions + '][title]',
            questionText = 'question[' + existing_questions + '][text]',
            answerText = 'question[' + existing_questions + ']answer[0]',
            answerValue = 'question[' + existing_questions + ']value[0]',
            resultChoice = 'question[' + existing_questions + ']category[0]',
            resultChoicesOptions = studioCommon.getChoicesList(),

            html = tmpl({
                order: existing_questions + 1,
                type: type,
                questionTitle: questionTitle,
                questionText: questionText,
                answerText: answerText,
                answerValue: answerValue,
                resultChoice: resultChoice,
                resultChoicesOptions: resultChoicesOptions
            });
        $(html).insertBefore(link);
        studioCommon.initiateHtmlEditor($(questionPanel));
    };

    handler.addNewChoice = function(link, result) {
        // Handler to add new question choice html
        var link = $(link),
            type = studioCommon.getQuizType(),
            template = JSON.parse(result).template,
            tmpl = _.template(template),

            // count existing choices
            existing_choices = link.prev().find(choiceSelector).length,
            question_name = link.prevAll(questionFieldSelector).find(questionTextSelector).first().attr('name').split("][")[0]+ "]",
            answerText = question_name + 'answer[' + existing_choices + ']',
            answerValue = question_name + 'value[' + existing_choices + ']',
            resultChoice = question_name + 'category[' + existing_choices + ']',
            resultChoicesOptions = studioCommon.getChoicesList(),

            html = tmpl({
                type: type,
                answerText: answerText,
                answerValue: answerValue,
                resultChoice: resultChoice,
                resultChoicesOptions: resultChoicesOptions
            });
        link.prev('ol').append(html);
    };
}
