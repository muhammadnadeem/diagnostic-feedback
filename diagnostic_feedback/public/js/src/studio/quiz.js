function Quiz(runtime, element, initData) {
  // contain js related to studio quiz wizard

  // import related js helpers
  var customValidator = new CustomValidator(runtime, element, initData),
    common = new Common(runtime, element, initData),
    studioCommon = new StudioCommon(runtime, element, initData),
    setting = new Setting(runtime, element, initData),
    editQuestionPanel = ".diagnostic-feedback .edit_questionnaire_panel";

  if (typeof gettext == "undefined") {
    window.gettext = function gettext_stub(string) {
      return string;
    };
    window.ngettext = function ngettext_stub(strA, strB, n) {
      return n == 1 ? strA : strB;
    };
  }

  $(function ($) {

    // show quiz wizard html after popup loads its resources
    studioCommon.showQuizForm();

    // selector' to scope elements for the current XBlock instance, to
    // differentiate multiple diagnostic feedback blocks on one page
    var $form = $(".diagnostic-feedback .questionnaire-form", element),
      $step1Panel = $(".diagnostic-feedback section[step='1']", element),

      // child selector' which are either searched in an element already in current XBlock instance scope OR
      // used as combination with some other selector, will be scoped to current XBlock instance (if required)
      // at their usage places

      categoriesPanel = '.diagnostic-feedback .categories_panel',
      addNewCategoryBtn = categoriesPanel + ' .add-new-category',
      addNewGroupBtn = '.add-new-group',
      deleteCategoryBtn = '.delete-category',
      categorySelector = '.category',
      editorSelector = '.custom-textarea',
      questionGrpSelector = '.question-group',
      grpError = 'group-error',

      accordionSelector = '.accordion',
      accordionGrpSelector = ".group",

      rangesPanel = '.ranges_panel',
      addNewRangeBtn = rangesPanel + ' .add-new-range',
      deleteRangeBtn = '.delete-range',
      rangeSelector = '.range',

      step3Panel = ".diagnostic-feedback section[step='3']",
      questionPanel = '.diagnostic-feedback .questions_panel',
      addNewQuestionBtn = '.add-new-question',
      deleteQuestionBtn = '.delete-question',
      questionSelector = '.question',

      addNewChoiceBtn = '.add-new-choice',
      deleteChoiceBtn = '.delete-choice',
      choiceSelector = '.answer-choice',
      toolTipSelector = '.diagnostic-feedback .custom-tooltip',
      closeMsgBtnSelector = '.close_msg';

    function renderSteps() {
      // render all steps html as XBlock studio view load

      if (initData.quiz_type == "") {
        // when first time studio view opens with no initData
        studioCommon.renderCategories();
        studioCommon.createAccordion(categoriesPanel+ " " + accordionSelector, 'categories');

        studioCommon.renderRanges();
        studioCommon.createAccordion(rangesPanel+ " " + accordionSelector, 'ranges');
      } else if (initData.quiz_type == initData.BUZZFEED_QUIZ_VALUE) {
        // when editing buzzfeed-style quiz
        studioCommon.renderCategories();
        studioCommon.createAccordion(categoriesPanel+ " " + accordionSelector, 'categories');
      } else {
        // when editing dignostic-style quiz
        studioCommon.renderRanges();
        studioCommon.createAccordion(rangesPanel+ " " + accordionSelector, 'ranges');
      }
      studioCommon.renderQuestions();
      studioCommon.createAccordion(questionPanel+ " " + accordionSelector, 'questions');
    }

    //initialize js validations if on in setting.js
    if (setting.jsValidation) {
      // initialize jQuery validation on form
      $form.validate({
        success: function (label, element) {
          if ($(element).is("textarea")) {
            $(element).prev(toolTipSelector).remove();
          } else {
            $(element).next(toolTipSelector).remove();
          }

          var groups = $(element).parents('.group');
          if(groups.length > 0){
            groups.removeClass(grpError);
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

          var groups = element.parents('.group');
          if(groups.length > 0){
            groups.addClass(grpError);
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
        async: false,
        type: "POST",
        url: answerHandlerUrl,
        data: JSON.stringify(data),
      });
    }

    function submitToSave(currentStep) {
      var success = false;
      $.when(submitForm(currentStep)).done(function (response) {
        //runtime.refreshXBlock(element);
        if (response.success) {
          success = true;

          //close modal window if step3 saved successfully
          if (response.step == 3) {
            if (showInvalidChoiceValueWarning.showWarning) {
              common.showMessage({
                success: false,
                warning: true,
                persist: true,
                msg: '<br />' +
                gettext('Your data has been successfully saved.') +
                '<br />' +
                gettext('However, some answer combinations in "' + showInvalidChoiceValueWarning. warningGroup +
                  '" may not belong to any result in that group.') +
                '<a class="close_msg" href="#" style="float: right">' +
                gettext('Close') +
                '</a>'
              });
              showInvalidChoiceValueWarning.showWarning = false;
            } else {
              studioCommon.closeModal(runtime.modal);
            }
          }
        }

        if (response.step != 3 || (response.step == 3 && !response.success)) {
          common.showMessage(response);
        }
      });
      return success;
    }

    function validateAndSave(event, currentIndex, newIndex) {
      // send validated step data to server, this method will return true/false
      // if return true next stepp will be loaded
      // if return false validation errors will be shown

     // generic validation rules
     var fieldToIgnore = [
       'section:visible .skip-validation',
       'section:hidden input',
       'section:hidden textarea',
       'section:hidden select'
     ],
     quizType = studioCommon.getQuizType(),
     customValidated = false;

      tinyMCE.triggerSave();

      if (currentIndex > newIndex) {
        // allow to move backwards without validate & save
        return true;
      } else {
        //validate and save data if moving next OR at last step
        var currentStep = currentIndex + 1;

        //execute both server side & js validations if on in setting.js
        if (setting.jsValidation) {
          //ignore hidden fields; will validate on current step showing fields
          if (currentStep == 2 ) {
            // add step-2 related validation rules
            if (quizType == initData.BUZZFEED_QUIZ_VALUE){
              // in buzzfeed-style quiz ignore diagnostic-style quiz (ranges) related fields
              fieldToIgnore = fieldToIgnore.concat([
                'section:visible .ranges_panel input:hidden',
                'section:visible .ranges_panel select:hidden'
              ]);
            } else {
              // in diagnostic-style quiz ignore buzzfeed-style quiz (categories) related fields
              fieldToIgnore = fieldToIgnore.concat([
                'section:visible .categories_panel input:hidden',
                'section:visible .categories_panel select:hidden'
              ]);
            }

          } else {
            // add step-3 related validation rules
            if(quizType == initData.BUZZFEED_QUIZ_VALUE){
              // in buzzfeed-style quiz ignore diagnostic-style quiz related fields
              fieldToIgnore = fieldToIgnore.concat([
                'section:visible input.answer-value:hidden'
              ]);
            }else {
              // in diagnostic-style quiz ignore buzzfeed-style quiz related fields
              fieldToIgnore = fieldToIgnore.concat([
                'section:visible select.result-choice:hidden'
              ]);
            }
          }
          $form.validate().settings.ignore = fieldToIgnore.join(", ");

          // run jquery.validate
          // run extra validations if jquery vlidations are passed
          var isValid = $form.valid();
          if (isValid) {
            customValidated = customValidator.customStepValidation(currentStep);
          } else {
            console.log($form.validate().errorList);
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
    $form.children("div").steps({
      headerTag: "h3",
      bodyTag: "section",
      transitionEffect: "slideLeft",
      onStepChanging: validateAndSave,
      onFinishing: validateAndSave,
      labels: {
        cancel: gettext("Cancel"),
        current: gettext("Current Step"),
        finish: gettext("Save"),
        next: gettext("Next"),
        previous: gettext("Previous"),
        loading: gettext("Loading ...")
      }
    });

    $(addNewCategoryBtn, element).click(function (eventObject) {
      // Add new category template to page

      eventObject.preventDefault();
      var link = $(eventObject.currentTarget),
        existingCategories = link.prev().find(accordionGrpSelector).length,
        categoriesPanelObj = $(categoriesPanel, element);

      studioCommon.renderSingleCategory(existingCategories);
      studioCommon.initiateHtmlEditor(categoriesPanelObj);
      studioCommon.refreshAccordion(categoriesPanel + " " + accordionSelector);
      studioCommon.bindSortTitleSource(categoriesPanelObj);
      studioCommon.bindGroupAutoComplete(categoriesPanelObj);
    });

    $(addNewRangeBtn, element).click(function (eventObject) {
      // Add new range template to page

      eventObject.preventDefault();
      var link = $(eventObject.currentTarget),
        existingRanges = link.prev().find(accordionGrpSelector).length,
        rangesPanelObj = $(rangesPanel, element);

      studioCommon.renderSingleRange(existingRanges);
      studioCommon.initiateHtmlEditor(rangesPanelObj);
      studioCommon.refreshAccordion(rangesPanel + " " + accordionSelector);
      studioCommon.bindSortTitleSource(rangesPanelObj);
      studioCommon.bindGroupAutoComplete(rangesPanelObj);
    });

    $(editQuestionPanel, element).on('click', addNewGroupBtn, function (eventObject) {
      // Add new range template to page

      eventObject.preventDefault();

      var groupHandlerUrl = runtime.handlerUrl(element, 'add_group'),
        el = $(eventObject.currentTarget),
        field = el.prevAll('.group-auto-complete'),
        name = field.val();

      if (name){

        $.ajax({
          type: "POST",
          url: groupHandlerUrl,
          data: JSON.stringify({name: name}),
          success: function(response) {
            var success, warning;
            if(response.success){
              success = true;
              warning = false;
              studioCommon.updateAutoCompleteSource(response.grp_name);
              studioCommon.updateSortingGroupTxt(el, response.grp_name);
            } else {
              success = true;
              warning = false;
            }
            common.showMessage({
              success: success,
              warning: warning,
              persist: false,
              msg: response.msg
            });

            el.remove();

          },
          error: function(response) {
              console.log(response);
          }
        });
      }
    });


    $(step3Panel, element).on('click', addNewQuestionBtn, function (eventObject) {
      // Add new question template to page

      eventObject.preventDefault();

      var link = $(eventObject.currentTarget),
        existingQuestions = link.prev().find(accordionGrpSelector).length;

      studioCommon.renderSingleQuestion(existingQuestions);
      studioCommon.initiateHtmlEditor($(questionPanel, element));
      studioCommon.refreshAccordion(questionPanel + " " + accordionSelector);
      studioCommon.bindSortTitleSource($(questionPanel, element));
    });

    $(questionPanel, element).on('click', addNewChoiceBtn, function (eventObject) {
      // Add new choice html to question container

      eventObject.preventDefault();
      var link = $(eventObject.currentTarget),
        group = link.parent(questionSelector).find(questionGrpSelector).val(),
        existingQuestions = link.parents(accordionGrpSelector).prevAll(accordionGrpSelector).length,
        existingChoices = link.prev().find(choiceSelector).length;

      var choiceHtml = studioCommon.renderSingleChoice(existingQuestions, existingChoices, undefined, false, group);

      link.prev('ol').append(choiceHtml);
    });

    $(categoriesPanel, element).on('click', deleteCategoryBtn, function (eventObject) {
      // delete some category

      eventObject.preventDefault();

      var btn = $(eventObject.currentTarget),
        categoriesContainer = $(btn).parents(categoriesPanel).first();

      if (categoriesContainer.find(categorySelector).length == 1) {
        // show waring if trying to delete last category
        common.showMessage({
          success: false,
          warning: true,
          persist: true,
          msg: gettext('At least one category is required')
        }, categoriesContainer.find(accordionGrpSelector));
      } else {
        // ask for confirmation before delete action
        if (studioCommon.confirmAction(gettext('Are you sure to delete this category?'))) {
          var category = $(btn).parents(accordionGrpSelector);

          //remove deleted category html at step3 from all category selection dropdowns
          studioCommon.removeCategoryFromOptions(category);

          //remove all tinymce binding before deleting category html
          studioCommon.destroyAllEditors(categoriesContainer);

          //remove category html from DOM at current step
          category.remove();

          // refresh accordion
          studioCommon.refreshAccordion(categoriesPanel + " " + accordionSelector);

          // rename all remaining categories fields after deletion of a category
          studioCommon.processCategories(categoriesContainer);
        }
      }
    });

    $(rangesPanel, element).on('click', deleteRangeBtn, function (eventObject) {
      // delete existing range
      eventObject.preventDefault();

      var btn = $(eventObject.currentTarget);
      var rangesContainer = $(btn).parents(rangesPanel).first();

      if (rangesContainer.find(rangeSelector).length == 1) {
        //show waring if trying to delete last range
        common.showMessage({
          success: false,
          warning: true,
          persist: true,
          msg: gettext('At least one range is required')
        }, rangesContainer.find(accordionGrpSelector));
      } else {
        // ask for confirmation before delete action
        if (studioCommon.confirmAction(gettext('Are you sure to delete this range?'))) {
          var range = $(btn).parents(accordionGrpSelector);
          studioCommon.destroyAllEditors(rangesContainer);

          range.remove();

          // refresh accordion
          studioCommon.refreshAccordion(rangesPanel + " " + accordionSelector);

          // rename all remaining categories fields after deletion of a category
          studioCommon.processRanges(rangesContainer);
        }
      }
    });

    $(questionPanel, element).on('click', deleteQuestionBtn, function (eventObject) {
      // delete question
      eventObject.preventDefault();
      var btn = $(eventObject.currentTarget);
      var questionsContainer = $(btn).parents(questionPanel).first();

      if (questionsContainer.find(questionSelector).length == 1) {
        //show waning if tring to delete last question
        common.showMessage({
          success: false,
          warning: true,
          persist: true,
          msg: gettext('At least one question is required')
        }, questionsContainer.find(accordionGrpSelector));
      } else {
        //ask for confirmation before delete action
        if (studioCommon.confirmAction(gettext('Are you sure to delete this question?'))) {
          var question = $(btn).parents(accordionGrpSelector);

          // remove all tinymce binding before deleting question html
          studioCommon.destroyEditor($(question).find(editorSelector));

          //remove question html from DOM
          question.remove();

          // refresh accordion
          studioCommon.refreshAccordion(questionPanel + " " + accordionSelector);

          // rename all remaining categories fields after deletion of a category
          studioCommon.processQuestions(questionsContainer);
        }
      }
    });

    $(questionPanel, element).on('change', questionGrpSelector, function(eventObject){
        eventObject.preventDefault();
        var group = $(eventObject.target).val();
        var grpCategories = studioCommon.getGroupCategories(group);
        studioCommon.updateSortingGroupTxt($(eventObject.target), group);
        studioCommon.updateAllResultDropwdowns($(eventObject.target), grpCategories);
    });

    $(questionPanel, element).on('click', deleteChoiceBtn, function (eventObject) {
      // delete question choice

      eventObject.preventDefault();

      var btn = $(eventObject.currentTarget);
      var answersContainer = $(btn).parents(questionSelector).first();

      if (answersContainer.find(choiceSelector).length == 1) {
        //show warning if trying to delete last choice
        common.showMessage({
          success: false,
          warning: true,
          msg: gettext('At least one answer is required')
        }, answersContainer);
      } else {
        //ask for confirmation before delete action
        if (studioCommon.confirmAction(gettext('Are you sure to delete this choice?'))) {
          //remove choice html from DOM
          $(btn).parent(choiceSelector).remove();

          // rename all remaining choices fields of specific question
          var remainingChoices = answersContainer.find(choiceSelector);
          $.each(remainingChoices, function (j, choice) {
            studioCommon.updateChoiceFieldAttr(choice, j);
          });
        }
      }
    });

    $(editQuestionPanel, element).on('click', closeMsgBtnSelector, function (eventObject) {
      eventObject.preventDefault();

      var btn = $(eventObject.currentTarget);
      var msgDiv = btn.parents('.msg');
      btn.parents("h3").first().html("");
      msgDiv.slideUp('slow');
    });


    renderSteps();
    studioCommon.initiateHtmlEditor($step1Panel, true);
    studioCommon.bindSortTitleSources();
    studioCommon.bindGroupAutoComplete();

    $('.action-cancel').click(function (eventObject) {
      // notify runtime that modal windows is going to close
      eventObject.preventDefault();
      studioCommon.notify('destoryEditors', {});
    });

    runtime.listenTo('destoryEditors', function(){
      // Destroy all editor as modal window closed
      studioCommon.destroyAllEditors($(editQuestionPanel, element));
      runtime.modal.editOptions.refresh(runtime.modal.xblockInfo);
    });
  });
  
}
