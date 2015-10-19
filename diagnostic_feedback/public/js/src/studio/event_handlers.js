function EventHandler(runtime, element){
    var handler = this;
    var studioCommon = new StudioCommon();

    handler.addNewCategory = function(link, result) {
        // Handler to add new category on step2

        var link = $(link);
        var template = JSON.parse(result).template;
        var tmpl = _.template(template);

        var existing_categories = link.prevAll('.category').length;
        var idFieldAttrs = 'category[id][' + existing_categories + ']';
        var nameFieldAttrs = 'category[name][' + existing_categories + ']';
        var imageFieldAttrs = 'category[image][' + existing_categories + ']';
        var htmlBodyFieldAttrs = 'category[html_body][' + existing_categories + ']';
        var html = tmpl({
            idFieldAttrs: idFieldAttrs,
            nameFieldAttrs: nameFieldAttrs,
            imageFieldAttrs: imageFieldAttrs,
            htmlBodyFieldAttrs: htmlBodyFieldAttrs
        });
        $(html).insertBefore(link);
        studioCommon.initiateHtmlEditor($('#categories_panel'));
        //$("textarea[id='"+htmlBodyFieldAttrs+"']").prev().focus();
    };

    handler.addNewRange = function(link, result) {
        // Handler to add new range on step2

        var link = $(link);
        var template = JSON.parse(result).template;
        var tmpl = _.template(template);

        var existing_ranges = link.prevAll('.range').length;
        var idFieldAttrs = 'range[id][' + existing_ranges + ']';
        var nameFieldAttrs = 'range[name][' + existing_ranges + ']';
        var minFieldAttrs = 'range[min][' + existing_ranges + ']';
        var maxFieldAttrs = 'range[max][' + existing_ranges + ']';
        var imageFieldAttrs = 'range[image][' + existing_ranges + ']';
        var htmlBodyFieldAttrs = 'range[html_body][' + existing_ranges + ']';
        var html = tmpl({
            idFieldAttrs: idFieldAttrs,
            nameFieldAttrs: nameFieldAttrs,
            minFieldAttrs: minFieldAttrs,
            maxFieldAttrs: maxFieldAttrs,
            imageFieldAttrs: imageFieldAttrs,
            htmlBodyFieldAttrs: htmlBodyFieldAttrs
        });
        $(html).insertBefore(link);
        studioCommon.initiateHtmlEditor($('#ranges_panel'));
        //studioCommon.scrollToBottom();
        //$("textarea[id='"+htmlBodyFieldAttrs+"']").prev().focus();
    };

    handler.addNewQuestion = function(link, result) {
        // Handler to add new question html

        var link = $(link);
        var type = studioCommon.getQuizType();

        var template = JSON.parse(result).template;
        var tmpl = _.template(template);

        // count existing questions
        var existing_questions = link.prevAll('.question').length;
        var questionText = 'question[' + existing_questions + ']';
        var answerText = 'question[' + existing_questions + ']answer[0]';
        var answerValue = 'question[' + existing_questions + ']value[0]';
        var resultChoice = 'quesiton[[' + existing_questions + ']category[0]';
        var resultChoicesOptions = studioCommon.getChoicesList();

        var html = tmpl({
            order: existing_questions + 1,
            type: type,
            questionText: questionText,
            answerText: answerText,
            answerValue: answerValue,
            resultChoice: resultChoice,
            resultChoicesOptions: resultChoicesOptions
        });
        $(html).insertBefore(link);
        //$("textarea[id='"+htmlBodyFieldAttrs+"']").prev().focus();
    };

    handler.addNewChoice = function(link, result) {
        // Handler to add new question choice html
        var link = $(link);
        var type = studioCommon.getQuizType();
        var template = JSON.parse(result).template;
        var tmpl = _.template(template);

        // count existing choices
        var existing_choices = link.prev().find('.answer-choice').length;
        var question_name = link.prevAll('.question_field').find('.question-txt').first().attr('name');
        var answerText = question_name + 'answer[' + existing_choices + ']';
        var answerValue = question_name + 'value[' + existing_choices + ']';
        var resultChoice = question_name + 'category[' + existing_choices + ']';
        var resultChoicesOptions = studioCommon.getChoicesList();

        var html = tmpl({
            type: type,
            answerText: answerText,
            answerValue: answerValue,
            resultChoice: resultChoice,
            resultChoicesOptions: resultChoicesOptions
        });
        link.prev('ol').append(html);
    };

     $(function ($) {


    });
}
