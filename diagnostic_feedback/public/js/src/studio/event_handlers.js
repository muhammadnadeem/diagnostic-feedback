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


    handler.addNewCategory = function(link, template) {
        // Handler to add new category on step2

        var link = $(link),
            existing_categories = link.prevAll(categorySelector).length;

        studioCommon.renderSingleCategory(existing_categories);
        studioCommon.initiateHtmlEditor($(categoriesPanel));
    };

    handler.addNewRange = function(link) {
        // Handler to add new range on step2

        var link = $(link),
            existing_ranges = link.prevAll(rangeSelector).length;

        studioCommon.renderSingleRange(existing_ranges);
        studioCommon.initiateHtmlEditor($(rangesPanel));
    };

    handler.addNewQuestion = function(link) {
        // Handler to add new question html

        var link = $(link),
            existing_questions = link.prevAll(questionSelector).length;

        studioCommon.renderSingleQuestion(existing_questions);
        studioCommon.initiateHtmlEditor($(questionPanel));
    };

    handler.addNewChoice = function(link) {
        // Handler to add new question choice html
        var link = $(link),
            existing_questions = link.parent(questionSelector).prevAll(questionSelector).length,
            existing_choices = link.prev().find(choiceSelector).length;

        var choiceHtml = studioCommon.renderSingleChoice(existing_questions, existing_choices);

        link.prev('ol').append(choiceHtml);
    };
}
