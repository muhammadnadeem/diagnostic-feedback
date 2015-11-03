function EventHandler(runtime, element){
    var handler = this,
    studioCommon = new StudioCommon();

    handler.addNewCategory = function(link, result) {
        // Handler to add new category on step2

        var link = $(link),
            template = JSON.parse(result).template,
            tmpl = _.template(template),

            existing_categories = link.prevAll('.category').length,
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
        studioCommon.initiateHtmlEditor($('#categories_panel'));
    };

    handler.addNewRange = function(link, result) {
        // Handler to add new range on step2

        var link = $(link),
            template = JSON.parse(result).template,
            tmpl = _.template(template),

            existing_ranges = link.prevAll('.range').length,
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
        studioCommon.initiateHtmlEditor($('#ranges_panel'));
        //studioCommon.scrollToBottom();
    };

    handler.addNewQuestion = function(link, result) {
        // Handler to add new question html

        var link = $(link),
            type = studioCommon.getQuizType(),

            template = JSON.parse(result).template,
            tmpl = _.template(template),

            // count existing questions
            existing_questions = link.prevAll('.question').length,
            questionText = 'question[' + existing_questions + ']',
            answerText = 'question[' + existing_questions + ']answer[0]',
            answerValue = 'question[' + existing_questions + ']value[0]',
            resultChoice = 'question[' + existing_questions + ']category[0]',
            resultChoicesOptions = studioCommon.getChoicesList(),

            html = tmpl({
                order: existing_questions + 1,
                type: type,
                questionText: questionText,
                answerText: answerText,
                answerValue: answerValue,
                resultChoice: resultChoice,
                resultChoicesOptions: resultChoicesOptions
            });
        $(html).insertBefore(link);
    };

    handler.addNewChoice = function(link, result) {
        // Handler to add new question choice html
        var link = $(link),
            type = studioCommon.getQuizType(),
            template = JSON.parse(result).template,
            tmpl = _.template(template),

            // count existing choices
            existing_choices = link.prev().find('.answer-choice').length,
            question_name = link.prevAll('.question_field').find('.question-txt').first().attr('name'),
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
