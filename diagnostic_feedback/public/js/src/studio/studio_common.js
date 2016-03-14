function StudioCommon(runtime, element, initData) {
    "use strict";

    if (typeof gettext === "undefined") {
        window.gettext = function gettext_stub(string) {
            return string;
        };
        window.ngettext = function ngettext_stub(strA, strB, n) {
            return n === 1 ? strA : strB;
        };
    }


    var commonObj = this,
        tiny_mce_css_links = '',
        setting = new Setting(),
        allGroups = initData.groups,
        attachedGroups = initData.attachedGroups,

    // selector' to scope elements for the current XBlock instance, to
    // differentiate multiple diagnostic feedback blocks on one page
        $loadingDiv = $('.diagnostic-feedback .wizard-loading', element),
        $editQuizPanel = $('.diagnostic-feedback .edit_questionnaire_panel', element),

    // child selector' which are either searched in an element already in current XBlock instance scope OR
    // used as combination with some other selector, will be scoped to current XBlock instance (if required)
    // at their usage places
        quizTitle = '.diagnostic-feedback input[name*="title"]',
        selectedQuizType = '.diagnostic-feedback select[name*="type"] option:selected',
        quizTypeInput = '.diagnostic-feedback input[name*="type"]',
        quizDescription = '.diagnostic-feedback textarea[name*="description"]',
        accordionEl = '.accordion',
        questionGroupField = '.question-group',

        sortTitle = '.sort-title',
        sortTitleGroup = '.sort-title-group',
        sortTitleSrc = '.sort-title-source',

        accordionGroup = ".group",

        editQuestionPanel = ".diagnostic-feedback .edit_questionnaire_panel",
        questionPanel = '.diagnostic-feedback .questions_panel',
        questionDiv = '.question',
        questionIdField = '.question-id',
        questionFieldsContainer = '.question-field',
        questionTxtField = '.question-txt',
        questionTitleField = '.question-title',
        questionOrder = ".question-order",
        questionOrderField = ".question-order-field",

        categoriesPanel = ".diagnostic-feedback .categories_panel",
        categoryDiv = '.category',
        categoryIdField = 'input[name*="category[id]"]',
        categoryOrder = ".category-order",
        categoryOrderField = "input[name*='category[order]']",
        tinyMceTextarea = '.custom-textarea',

        rangesPanel = '.diagnostic-feedback .ranges_panel',
        rangeDiv = '.range',
        rangeOrderEl = ".range-order",
        rangeOrderField = "input[name*='range[order]']",

        allChoiceValuesInputs = '.diagnostic-feedback .answer-choice .answer-value',
        choiceDiv = '.answer-choice',
        allResultChoicesDropdowns = '.diagnostic-feedback .answer-choice .result-choice',
        questionResultChoicesDropdowns = '.answer-choice .result-choice',
        allQuestionGroupChoicesDropdowns = '.diagnostic-feedback .question-group',
        allResultGroupChoicesDropdowns = '.diagnostic-feedback .result-group',
        choiceValueField = 'input[name*="]value["]',
        choiceValueByClass = '.answer-value',
        choiceName = 'input[name*=answer]',
        choiceResult = '.result-choice',
        allResultChoice = '.diagnostic-feedback .result-choice',
        choiceNameByClass = '.answer-txt';


    var CUSTOM_FONTS, STANDARD_FONTS, _getFonts;

    CUSTOM_FONTS = "Default='Open Sans', Verdana, Arial, Helvetica, sans-serif;";

    STANDARD_FONTS = "Andale Mono=andale mono,times;" + "Arial=arial,helvetica,sans-serif;" +
        "Arial Black=arial black,avant garde;" + "Book Antiqua=book antiqua,palatino;" +
        "Comic Sans MS=comic sans ms,sans-serif;" + "Courier New=courier new,courier;"
        + "Georgia=georgia,palatino;" + "Helvetica=helvetica;" + "Impact=impact,chicago;"
        + "Symbol=symbol;" + "Tahoma=tahoma,arial,helvetica,sans-serif;" + "Terminal=terminal,monaco;"
        + "Times New Roman=times new roman,times;" + "Trebuchet MS=trebuchet ms,geneva;"
        + "Verdana=verdana,geneva;" + "Webdings=webdings;" + "Wingdings=wingdings,zapf dingbats";

    _getFonts = function () {
        return CUSTOM_FONTS + STANDARD_FONTS;
    };

    tinyMCE.baseURL = "" + baseUrl + "/js/vendor/tinymce/js/tinymce";
    tinyMCE.suffix = ".min";

    commonObj.notify = function (name, data) {
        // Notification interface does not exist in the workbench.
        if (runtime.notify) {
            runtime.notify(name, data);
        }
    };

    commonObj.showQuizForm = function () {
        // show quiz wizard html after popup resources loading

        $loadingDiv.addClass('hide');
        $editQuizPanel.removeClass('hide');
    };

    commonObj.getQuizType = function () {
        // get type of quiz from DOM
        var q_type = $(selectedQuizType, element).val();
        if (!q_type) {
            q_type = $(quizTypeInput, element).val();
        }
        return q_type ? q_type : "";
    };

    commonObj.closeModal = function (modal) {
        // close studio edit popup
        commonObj.notify('destoryEditors', {});
        modal.cancel();
    };

    commonObj.sumArray = function (_array) {
        // return sum of an array

        var total = 0;
        $.each(_array, function (j, value) {
            total += value;
        });
        return total;
    };

    commonObj.updateResultSortTitle = function (eventObject) {
        eventObject.preventDefault();

        var _input = $(eventObject.currentTarget),
            inputVal = $(_input).val() === '' ? gettext("Untitled") : $(_input).val();

        $(_input).parents(accordionGroup).find(sortTitle).html(inputVal);
    };

    commonObj.bindSortTitleSources = function () {
        $.each($(editQuestionPanel, element).find(sortTitleSrc + ', ' + questionTitleField), function () {
            $(this).unbind('keyup');
            $(this).bind('keyup', commonObj.updateResultSortTitle);
        });
    };

    commonObj.bindSortTitleSource = function (container) {
        container.find(sortTitleSrc + ', ' + questionTitleField).bind('keyup', commonObj.updateResultSortTitle);
    };

    commonObj.getAllWQuestionsChoices = function () {
        // return array of array for all choices values of all questions (per group)

        var questionsChoices = {};
        $.each($(questionPanel + ' ' + questionDiv), function (i, question) {
            var qGroup = $(question).find(questionGroupField).val();
            if (!(qGroup in questionsChoices)) {
                questionsChoices[qGroup] = [];
            }
            var choices = [];
            $.each($(question).find(choiceValueField), function (j, choice) {
                choices.push(parseFloat($(choice).val()));
            });
            questionsChoices[qGroup].push(choices);
        });
        return questionsChoices;
    };

    commonObj.allPossibleAnswers = function (arrayOfArrays) {
        // return all possible answers combination for all questions of a quiz

        if (Object.prototype.toString.call(arrayOfArrays) !== '[object Array]') {
            throw new Error("combinations method was passed a non-array argument");
        }

        var combinations = [],
            comboKeys = [],
            numOfCombos = arrayOfArrays.length ? 1 : 0,
            arrayOfArraysLength = arrayOfArrays.length;

        for (var n = 0; n < arrayOfArraysLength; ++n) {
            if (Object.prototype.toString.call(arrayOfArrays[n]) !== '[object Array]') {
                throw new Error("combinations method was passed a non-array argument");
            }
            numOfCombos = numOfCombos * arrayOfArrays[n].length;
        }

        for (var x = 0; x < numOfCombos; ++x) {
            var carry = x,
                comboKeys = [],
                combo = [];

            for (var i = 0; i < arrayOfArraysLength; ++i) {
                comboKeys[i] = carry % arrayOfArrays[i].length;
                carry = Math.floor(carry / arrayOfArrays[i].length);
            }
            for (var i = 0; i < comboKeys.length; ++i) {
                combo.push(arrayOfArrays[i][comboKeys[i]]);
            }
            // sum of combination is rounded because we are taking range values as 1 decimal point
            // so this sum should be compared with the start/end value of range to check if any answer
            // lies outside all the defined ranges
            combinations.push({'combination': combo, 'sum': commonObj.sumArray(combo)});
        }

        return combinations;
    };

    commonObj.termInStrArray = function (term, _array) {
        // check if a string exists in array of strings
        var isInArray = false;
        $.each(_array, function (i, value) {
            if (term.trim().toLowerCase() === value.trim().toLowerCase()) {
                isInArray = true;
                return false;
            }
        });
        return isInArray;
    };

    commonObj.showAddGroupPanel = function (btn) {
        // show add new grou panel
        btn.parent().parent().addClass('hidden');
        btn.parent().parent().prev().removeClass('hidden');
    };

    commonObj.hideAddGroupPanel = function (btn) {
        // show grops list dropdown
        btn.parent().parent().addClass('hidden');
        btn.parent().parent().next().removeClass('hidden');
    };

    commonObj.updateSortingGroupTxt = function (el, txt) {
        // update text for group in accordion header
        if (el.hasClass('question-group')) {
            if (txt) {
                txt = "( " + txt + " )";
            }
        }
        el.parents(accordionGroup).find(sortTitleGroup).text(txt);
    };

    // tinymce methods start

    commonObj.destroyAllEditors = function (container) {
        // destory all editors instances in a specific container
        var editors = container.find(tinyMceTextarea);
        $.each(editors, function (i, editor) {
            commonObj.destroyEditor(editor);
        });
    };

    commonObj.destroyEditor = function (editor) {
        //check if an intance already attached with any textarea
        if ($(editor).tinymce()) {
            //remove existing attached instances
            $(editor).tinymce().destroy();
        }
    };

    commonObj.showCodeEditor = function (source) {
        return commonObj.showCodeEditor.apply(commonObj, arguments);
    };

    commonObj.setupTinyMCE = function (ed) {
        ed.addButton('wrapAsCode', {
            title: 'Code block',
            image: "" + baseUrl + "/images/ico-tinymce-code.png",
            onclick: function () {
                return ed.formatter.toggle('code');
            }
        });

        ed.on('SaveImage', commonObj.saveImage);
        ed.on('EditImage', commonObj.editImage);
        ed.on('SaveLink', commonObj.saveLink);
        ed.on('EditLink', commonObj.editLink);
        ed.on('ShowCodeEditor', commonObj.showCodeEditor);
        return ed.on('SaveCodeEditor', commonObj.saveCodeEditor);
    };

    commonObj.editImage = function (data) {
        if (data['src']) {
            return data['src'] = rewriteStaticLinks(data['src'], initData.base_asset_url, '/static/');
        }
    };

    commonObj.saveImage = function (data) {
        if (data['src']) {
            return data['src'] = rewriteStaticLinks(data['src'], '/static/', initData.base_asset_url);
        }
    };

    commonObj.editLink = function (data) {
        if (data['href']) {
            return data['href'] = rewriteStaticLinks(data['href'], initData.base_asset_url, '/static/');
        }
    };

    commonObj.saveLink = function (data) {
        if (data['href']) {
            return data['href'] = rewriteStaticLinks(data['href'], '/static/', initData.base_asset_url);
        }
    };

    commonObj.showCodeEditor = function (source) {
        var content;
        content = rewriteStaticLinks(source.content, initData.base_asset_url, '/static/');
        return source.content = content;
    };

    commonObj.saveCodeEditor = function (source) {
        var content;
        content = rewriteStaticLinks(source.content, '/static/', initData.base_asset_url);
        return source.content = content;
    };

    commonObj.initInstanceCallback = function (visualEditor) {
        visualEditor.setContent(rewriteStaticLinks(visualEditor.getContent({
            no_events: 1
        }), '/static/', initData.base_asset_url));
        return visualEditor.focus();
    };

    commonObj.initiateHtmlEditor = function (container, destroyExisting, width, height) {
        // Add tinymce text editor on textarea with class .custom-textarea at step 2

        destroyExisting = typeof destroyExisting !== 'undefined' ? destroyExisting : false;
        width = typeof width !== 'undefined' ? width : '100%';
        height = typeof height !== 'undefined' ? height : '70px';


        //initialize tinymce on a textarea
        tiny_mce_css_links = [];
        $("link[rel=stylesheet][href*='tinymce']").filter("[href*='content']").each(function () {
            tiny_mce_css_links.push($(this).attr("href"));
        });


        if (setting.tinyMceAvailable) {
            $.each(container.find(tinyMceTextarea), function (i, textarea) {
                if (destroyExisting) {
                    commonObj.destroyEditor(textarea);
                }

                $(textarea).tinymce({
                    script_url: "" + baseUrl + "/js/vendor/tinymce/js/tinymce/tinymce.full.min.js",
                    font_formats: _getFonts(),
                    theme: 'modern',
                    skin: 'studio-tmce4',
                    schema: "html5",
                    convert_urls: false,
                    content_css: tiny_mce_css_links.join(", "),
                    formats: {
                        code: {inline: 'code'}
                    },
                    codemirror: {
                        path: "" + baseUrl + "/js/vendor"
                    },
                    visual: false,
                    plugins: "textcolor, link, image, codemirror",
                    image_advtab: true,
                    toolbar: "formatselect | fontselect | bold italic underline forecolor wrapAsCode | bullist numlist outdent indent blockquote | link unlink image | code",
                    block_formats: interpolate("%(paragraph)s=p;%(preformatted)s=pre;%(heading1)s=h1;%(heading2)s=h2;%(heading3)s=h3", {
                        paragraph: gettext("Paragraph"),
                        preformatted: gettext("Preformatted"),
                        heading1: gettext("Heading 1"),
                        heading2: gettext("Heading 2"),
                        heading3: gettext("Heading 3")
                    }, true),

                    height: height,
                    width: width,
                    menubar: false,
                    statusbar: false,
                    valid_children: "+body[style]",
                    valid_elements: "*[*]",
                    extended_valid_elements: "*[*]",
                    invalid_elements: "",
                    browser_spellcheck: true,
                    setup: commonObj.setupTinyMCE,
                    init_instance_callback: commonObj.initInstanceCallback,
                    toolbar_items_size: 'small',
                    resize: "both"
                });
            });
        }
    };

    // tinymce function's end

    commonObj.getStepData = function (step) {
        // Get data of a given step before sending to server

        var data = {step: step};
        var stepData = {};
        if (step === 1) {
            stepData = commonObj.getStep1Data();
        } else if (step === 2) {
            stepData = commonObj.getStep2Data();
        } else if (step === 3) {
            stepData = commonObj.getStep3Data();
        }
        data = $.extend(data, stepData);
        console.log(data);

        return data;
    };

    commonObj.updateAllResultDropwdowns = function (groupDropDown, categories) {
        // update html of all results dropdowns to sync with categories added at step2
        var dropDowns = groupDropDown.parent().nextAll('ol').find(questionResultChoicesDropdowns);
        $.each(dropDowns, function (i, dropdown) {
            var selectedValue = $(dropdown).val();
            var mappingOptions = commonObj.generateResultsHtml($(dropdown), categories);
            $(dropdown).html(mappingOptions);
            $(dropdown).val(selectedValue);
        });
    };

    commonObj.updateAllGroups = function (group) {
        // add new group to allGroups variable
        allGroups.push(group);
    };

    commonObj.getOptionsList = function (dropdown) {
        // get array list of option text of a given dropdown
        return $(dropdown).find('option').map(function () {
            var _value = $(this).val();
            if (_value !== "") {
                return $(this).val();
            }
        }).get()
    };

    commonObj.updateAllResultGroupDropwdowns = function () {
        // update html of all results group dropdowns to sync with new added group
        var dropDowns = $(allResultGroupChoicesDropdowns, element);
        $.each(dropDowns, function (i, dropdown) {
            var selectedValue = $(dropdown).val();
            var groupOptions = commonObj.generateGroupsHtml($(dropdown), allGroups);

            $(dropdown).html(groupOptions);
            $(dropdown).val(selectedValue);
        });
    };


    commonObj.updateAllQuestionGroupDropwdowns = function () {
        // update html of all questions group dropdowns to sync with groups added at step2

        var dropDowns = $(allQuestionGroupChoicesDropdowns, element);
        $.each(dropDowns, function (i, dropdown) {
            var selectedValue = "";
            if (attachedGroups.length === 1) {
                selectedValue = attachedGroups[0];
            } else {
                selectedValue = $(dropdown).val();
            }

            var groupOptions = commonObj.generateGroupsHtml($(dropdown), attachedGroups);
            $(dropdown).html(groupOptions);

            var options = commonObj.getOptionsList(dropdown);
            if (options.indexOf(selectedValue) < 0) {
                selectedValue = "";
            }

            $(dropdown).val(selectedValue);
            commonObj.updateSortingGroupTxt($(dropdown), selectedValue);

            if (initData.BUZZFEED_QUIZ_VALUE) {
                var selectedGroup = $(dropdown).val(),
                    categories = commonObj.getGroupCategories(selectedGroup);
                commonObj.updateAllResultDropwdowns($(dropdown), categories);
            }
        });
    };

    commonObj.generateResultsHtml = function (dropdown, categories) {
        // generate html of result dropdowns at step3

        //remove previously added elements to prevent duplication
        dropdown.find('option[value!=""]').remove();

        // Append newly added category/categories as result
        var _html = '';
        $.each(categories, function (i, category) {
            var id = category.id,
                name = category.name;

            _html += "<option value='" + id + "'>" + name + "</option>";
        });

        return dropdown.html() + _html;
    };

    commonObj.generateGroupsHtml = function (dropdown, groups) {
        // generate html of group dropdowns at step3


        //remove previously added elements to prevent duplication
        dropdown.find('option[value!=""]').remove();

        // Append newly added group/groups as result
        var _html = '';
        $.each(groups, function (i, group) {

            _html += "<option value='" + group + "'>" + group + "</option>";
        });

        return dropdown.html() + _html;
    };

    commonObj.updateAttachedGroups = function (results) {
        // update value of attachedGroups by iterating over results added at step2

        var groups = [];
        $.each(results, function (i, result) {
            if (groups.indexOf(result.group) < 0) {
                groups.push(result.group);
            }
        });

        attachedGroups = groups;
    };

    commonObj.updateNextForm = function (step, previousStepData) {
        // Manipulate DOM of next step in wizard, based on the last step selections

        var quizType = commonObj.getQuizType();
        if (step === 1) {
            // for 2nd step of wizard
            if (quizType === initData.BUZZFEED_QUIZ_VALUE) {
                // in case of quiz type is BuzzFeed
                // show categories html
                // hide ranges html
                // initialize tinymce text editor on textarea in categories_panel
                $(categoriesPanel, element).removeClass('hide').addClass('show');
                $(rangesPanel, element).removeClass('show').addClass('hide');
                commonObj.initiateHtmlEditor($(categoriesPanel, element), true);
            } else {
                // in case of quiz type is Diagnostic
                // show ranges html
                // hide categories html
                // initialize tinymce text editor on textarea in ranges_panel

                $(categoriesPanel, element).removeClass('show').addClass('hide');
                $(rangesPanel, element).removeClass('hide').addClass('show');
                commonObj.initiateHtmlEditor($(rangesPanel, element), true);
            }
        } else if (step === 2) {
            // for 3rd step of wizard
            var results = [];
            if (quizType === 'BFQ') {
                // in case quiz type is Buzzfeed
                // fill all results dropdown with categories selected at step 2
                // hide range related inputs and show result dropdowns
                results = previousStepData['categories'];
                $(allChoiceValuesInputs, element).hide();
                $(allResultChoicesDropdowns, element).show();

            } else {

                // in case quiz type is diagnostic
                // hide all results dropdowns and sow range related inputs
                results = previousStepData['ranges'];
                $(allResultChoicesDropdowns, element).hide();
                $(allChoiceValuesInputs, element).show();
            }
            commonObj.updateAttachedGroups(results);
            commonObj.updateAllQuestionGroupDropwdowns();
            commonObj.initiateHtmlEditor($(questionPanel, element), true);
        }
    };

    commonObj.updateFieldAttr = function (field, order) {
        // update the name/id of a single category/range filed
        var name = field.attr('name');

        if (typeof name !== typeof undefined && name !== false) {
            var previousName = name.split("][")[0];
            var newName = previousName + "][" + order + "]";
            field.attr({name: newName, id: newName});
        }
    };

    commonObj.updateQuestionFieldAttr = function (question, i) {
        //Update name/id attributes of a given question-txt field

        var questionTitle = initData.block_id + '_question[' + i + '][title]';
        var questionGroup = initData.block_id + '_question[' + i + '][group]';
        var questionText = initData.block_id + '_question[' + i + '][text]';
        $(question).find(questionTitleField).first().attr({'name': questionTitle, id: questionTitle});
        $(question).find(questionGroupField).first().attr({'name': questionGroup, id: questionGroup});
        $(question).find(questionTxtField).first().attr({'name': questionText, id: questionText});
    };

    commonObj.updateChoiceFieldAttr = function (choice, i) {
        //Update name/id attributes of a given choice field
        var questionName = $(choice).parent().prevAll(questionFieldsContainer).find(questionTxtField).first().attr('name').split("][")[0] + "]";
        var ChoiceAnswer = questionName + 'answer[' + i + ']';
        var ChoiceValue = questionName + 'value[' + i + ']';
        var CategoryValue = questionName + 'category[' + i + ']';

        $(choice).find(choiceName).attr({id: ChoiceAnswer, name: ChoiceAnswer});
        $(choice).find(choiceResult).attr({id: CategoryValue, name: CategoryValue});
        $(choice).find(choiceValueField).attr({id: ChoiceValue, name: ChoiceValue});
    };

    commonObj.confirmAction = function (msg) {
        //ask for confirmation of some action
        return confirm(msg);
    };

    commonObj.generateUniqueId = function () {
        // return unique id for category/question
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    commonObj.getGroupCategories = function (groupName) {
        // return all categories with in a group

        var allCategories = commonObj.getCategoriesList('category[name]');
        if (!groupName) {
            return allCategories;
        }

        var groupCategories = [];
        $.each(allCategories, function (i, category) {
            if (category.group === groupName) {
                groupCategories.push(category)
            }
        });
        return groupCategories;
    };


    commonObj.getGroupRanges = function (groupName) {
        // return all categories with in a group

        var allRanges = commonObj.getRangesList('range[name]');
        if (!groupName) {
            return allRanges;
        }

        var groupRangs = [];
        $.each(allRanges, function (i, range) {
            if (range.group === groupName) {
                groupRangs.push(range)
            }
        });
        return groupRangs;
    };

    commonObj.getCategoriesList = function (fieldName) {
        // Get list of categories at step2
        return $('input[name*="' + fieldName + '"]', element).map(function () {
            var order = $(this).attr('name').split('][')[1].replace(']', ''),
                id = $('input[name*="category[id][' + order + ']"]', element).val();

            if (!id) {
                id = commonObj.generateUniqueId();
                $('input[name*="category[id][' + order + ']"]', element).val(id);
            }

            var group = $('select[name*="category[group][' + order + ']"]', element).val(),
                name = this.value,
                catOrder = $('input[name*="category[order][' + order + ']"]', element).val(),
                image = $('input[name*="category[image][' + order + ']"]', element).val(),

                internalDescription = $('input[name*="category[internal_description][' + order + ']"]').val(),
                htmlBody = $('textarea[name*="category[html_body][' + order + ']"]', element).val();

            group = commonObj.termInStrArray(group, allGroups) ? group.trim() : initData.DEFAULT_GROUP;
            return {
                id: id, name: name, order: catOrder, image: image, group: group,
                internal_description: internalDescription, html_body: htmlBody
            };
        }).get();
    };

    commonObj.getRangesList = function (fieldName) {
        // Get list of ranges at step2
        return $('input[name*="' + fieldName + '"]', element).map(function () {

            var order = $(this).attr('name').split('][')[1].replace(']', ''),
                group = $('select[name*="range[group][' + order + ']"]', element).val(),
                name = this.value,
                rangeOrder = $('input[name*="range[order][' + order + ']"]', element).val(),
                minValue = $('input[name*="range[min][' + order + ']"]', element).val(),
                maxValue = $('input[name*="range[max][' + order + ']"]', element).val(),
                image = $('input[name*="range[image][' + order + ']"]', element).val(),
                internalDescription = $('input[name="range[internal_description][' + order + ']"]', element).val(),
                htmlBody = $('textarea[name*="range[html_body][' + order + ']"]', element).val();
            group = commonObj.termInStrArray(group, allGroups) ? group.trim() : initData.DEFAULT_GROUP;
            return {
                name: name, order: rangeOrder, min_value: minValue, max_value: maxValue, image: image, group: group,
                internal_description: internalDescription, html_body: htmlBody
            };
        }).get();
    };

    commonObj.getStep1Data = function () {
        // Return first step data

        var type = commonObj.getQuizType();
        return {
            title: $(quizTitle, element).val(),
            description: $(quizDescription, element).val(),
            type: type
        }
    };

    commonObj.getStep2Data = function () {
        // Get data of step2

        var type = commonObj.getQuizType();
        if (type === 'BFQ') {
            return {
                'categories': commonObj.getCategoriesList('category[name]')
            }
        } else {
            return {
                'ranges': commonObj.getRangesList('range[name]')
            }
        }

    };

    commonObj.getStep3Data = function () {
        // Get step3 data before posting to server

        var questionContainers = $(questionPanel + " " + questionDiv);
        var questions = [];
        $.each(questionContainers, function (i, container) {
            var group = $(container).find(questionGroupField).val();

            var questionObj = {
                order: $(container).find(questionOrderField).val(),
                question_title: $(container).find(questionTitleField).val(),
                group: group !== "" ? group.trim() : initData.DEFAULT_GROUP,
                question_txt: $(container).find(questionTxtField).val(),
                choices: []
            };

            var id = $(container).find(questionIdField).first().val();
            if (!id) {
                id = commonObj.generateUniqueId();
                $(container).find(questionIdField).first().val(id);
            }
            questionObj['id'] = id;
            var answerChoicesInputs = $(container).find(choiceNameByClass);
            $.each(answerChoicesInputs, function (j, choice) {
                var answerChoice = {
                    'choice_txt': $(choice).val(),
                    'choice_value': $(choice).parent().nextAll(choiceValueByClass).first().val(),
                    'choice_category': $(choice).parent().nextAll(choiceResult).val()
                };
                questionObj['choices'].push(answerChoice);
            });
            questions.push(questionObj);
        });
        return {'questions': questions};
    };

    commonObj.refreshAccordion = function (_id) {
        // refresg an instance of jquery-accordion
        $(_id).accordion('refresh');
    };

    commonObj.processCategories = function (categoriesContainer) {

        //update attributes of all category fields after sort/delete
        var remainingCategories = categoriesContainer.find(categoryDiv);

        $.each(remainingCategories, function (i, category) {
            var fields = $(category).find('input[type="text"], select, input[type="hidden"], textarea');

            $(category).parent().prev().find(categoryOrder).html(i + 1);
            $(category).find(categoryOrderField).val(i);

            $.each(fields, function (k, field) {
                commonObj.updateFieldAttr($(field), i);
            });
        });

        // Re-attach text editor after field renaming
        commonObj.initiateHtmlEditor($(categoriesPanel, element));
    };

    commonObj.processRanges = function (rangesContainer) {
        //update attributes of all range fields after sort/delete

        var remainingRanges = rangesContainer.find(rangeDiv);
        $.each(remainingRanges, function (i, range) {
            var fields = $(range).find('input[type="text"], select, input[type="number"], input[type="hidden"], textarea');

            $(range).parent().prev().find(rangeOrderEl).html(i + 1);
            $(range).find(rangeOrderField).val(i);

            $.each(fields, function (k, field) {
                commonObj.updateFieldAttr($(field), i);
            });
        });

        // re-attach text editor after field renaming
        commonObj.initiateHtmlEditor($(rangesPanel, element));
    };

    commonObj.processQuestions = function (questionsContainer) {
        // rename all remaining question fields including its choice
        var remainingQuestions = questionsContainer.find(questionDiv);
        $.each(remainingQuestions, function (i, question) {
            $(question).parent().prev().find(questionOrder).html(i + 1);
            $(question).find(questionOrderField).val(i);

            // rename all questions & choices fields after deletion of a question
            commonObj.updateQuestionFieldAttr(question, i);
            var questionChoices = $(question).find(choiceDiv);
            $.each(questionChoices, function (j, choice) {
                commonObj.updateChoiceFieldAttr(choice, j);
            });
        });

        // Re-attach tinymce after fields renaming
        commonObj.initiateHtmlEditor($(questionPanel, element));
    };

    commonObj.processChoices = function (answersContainer) {
        // rename all remaining choices fields of specific question
        var remainingChoices = answersContainer.find(choiceDiv);
        $.each(remainingChoices, function (j, choice) {
            commonObj.updateChoiceFieldAttr(choice, j);
        });

        // re-attach text editor after field renaming
        commonObj.initiateHtmlEditor(answersContainer.find('ol'));
    };

    commonObj.createAccordion = function (_id, type) {
        // attach jquery-accordion with an element
        $(_id)
            .accordion({
                active: 0,
                header: '> div > h3',
                autoHeight: true,
                collapsible: true
            })
            .sortable({
                axis: 'y',
                handle: 'h3',
                stop: function (event, ui) {
                    // IE doesn't register the blur when sorting
                    // so trigger focusout handlers to remove .ui-state-focus
                    ui.item.children('h3').triggerHandler('focusout');
                    if (type === 'categories') {
                        var categoriesContainer = $(categoriesPanel);
                        commonObj.destroyAllEditors(categoriesContainer);
                        commonObj.processCategories(categoriesContainer);
                    } else if (type === "ranges") {
                        var rangesContainer = $(rangesPanel);
                        commonObj.destroyAllEditors(rangesContainer);
                        commonObj.processRanges(rangesContainer);
                    } else {
                        var questionsContainer = $(questionPanel);
                        commonObj.destroyAllEditors(questionsContainer);
                        commonObj.processQuestions(questionsContainer);
                    }
                }
            });
    };

    commonObj.removeCategoryFromOptions = function (category) {
        // remove category option from all result dropdowns at step 3
        var categoryId = category.find(categoryIdField).val();

        $(allResultChoice + " option[value='" + categoryId + "']", element).remove();
    };


    commonObj.renderSingleCategory = function (order, category, returnHtml) {
        //Render html for a single category

        if (typeof category === 'undefined') {
            category = {id: '', name: '', image: '', group: '', internal_description: '', html_body: ''};
        }

        if (typeof category.id === 'undefined') {
            category['id'] = '';
        }

        category['order'] = order;
        category['DEFAULT_GROUP'] = initData.DEFAULT_GROUP;
        category['block_id'] = initData.block_id;
        category['allGroups'] = allGroups;

        var tpl = _.template(initData.categoryTpl),
            html = tpl(category);
        if (returnHtml){
            return html;
        } else {
            $(categoriesPanel).find(accordionEl).append(html);
        }
    };

    commonObj.renderSingleRange = function (order, range, returnHtml) {
        //Render html for a single range

        if (typeof range === 'undefined') {
            range = {
                name: '',
                min_value: '',
                max_value: '',
                image: '',
                group: '',
                internal_description: '',
                html_body: ''
            };
        }

        range['order'] = order;
        range['DEFAULT_GROUP'] = initData.DEFAULT_GROUP;
        range['block_id'] = initData.block_id;
        range['allGroups'] = allGroups;

        var tpl = _.template(initData.rangeTpl),
            html = tpl(range);

        if (returnHtml){
            return html;
        } else {
            $(rangesPanel).find(accordionEl).append(html);
        }
    };


    commonObj.renderSingleChoice = function (qOrder, cOrder, choice, returnChoiceObj, group) {
        //Render html for a single choice

        var quizType = commonObj.getQuizType();
        var returnChoiceObj = typeof returnChoiceObj !== 'undefined' ? returnChoiceObj : false;
        var group = typeof group !== 'undefined' ? group : initData.DEFAULT_GROUP;

        if (typeof choice === 'undefined') {
            choice = {name: '', value: '', category_id: ''};
        }

        choice['q_order'] = qOrder;
        choice['block_id'] = initData.block_id;
        choice['c_order'] = cOrder;
        choice['resultChoicesOptions'] = commonObj.getGroupCategories(group);
        choice['quiz_type'] = quizType;
        choice['BUZZFEED_QUIZ_VALUE'] = initData.BUZZFEED_QUIZ_VALUE;
        choice['DIAGNOSTIC_QUIZ_VALUE'] = initData.DIAGNOSTIC_QUIZ_VALUE;

        if (returnChoiceObj) {
            return choice;
        } else {
            var tpl = _.template(initData.choiceTpl),
                html = tpl(choice);

            return html;
        }
    };

    commonObj.renderSingleQuestion = function (order, question, returnHtml) {
        //Render html for a single question
        if (typeof question === 'undefined') {
            question = {
                id: '',
                title: '',
                text: '',
                group: '',
                choices: []
            }
        }

        question['order'] = order;
        question['block_id'] = initData.block_id;
        question['DEFAULT_GROUP'] = initData.DEFAULT_GROUP;
        question['allGroups'] = attachedGroups;

        // Render if questiong already have choices
        if (question.choices.length > 0) {
            // Render all existing choices
            var choices = [];
            $.each(question.choices, function (cOrder, choice) {
                choices.push(commonObj.renderSingleChoice(order, cOrder, choice, true, question.group));
            });
            question['choices'] = choices;
        } else {
            // Render new empty choice
            question['choices'] = [commonObj.renderSingleChoice(order, 0, undefined, true)];
        }

        var tpl = _.template(initData.questionTpl),
            html = tpl(question);

        if (returnHtml){
            return html;
        } else {
            $(questionPanel).find(accordionEl).append(html);
        }
    };

    commonObj.renderCategories = function () {
        //Render all categories html

        if (initData.results.length > 0) {
            // Render all existing categories
            $.each(initData.results, function (order, catergory) {
                commonObj.renderSingleCategory(order, catergory);
            });
        } else {
            // Render new category html
            commonObj.renderSingleCategory(0);
        }
    };

    commonObj.renderRanges = function () {
        //Render all ranges html

        if (initData.results.length > 0) {
            // Render all existing ranges
            $.each(initData.results, function (order, range) {
                commonObj.renderSingleRange(order, range);
            });
        } else {
            // Render new range html
            commonObj.renderSingleRange(0);
        }
    };

    commonObj.renderQuestions = function () {
        //Render all questions html

        if (initData.questions.length > 0) {
            // Render all existing questions
            $.each(initData.questions, function (order, question) {
                commonObj.renderSingleQuestion(order, question);
            });
        } else {
            // Render new question html
            commonObj.renderSingleQuestion(0);
        }
    };

}