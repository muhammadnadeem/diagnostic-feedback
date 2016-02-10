function CustomValidator(runtime, element, initData) {
  // contains all additional validation logic for wizard steps
  showInvalidChoiceValueWarning = {showWarning: false, warningGroup: ''};

  var validatorObj = this,
    studioCommon = new StudioCommon(runtime, element, initData),
    common = new Common(runtime, element, initData),

  //selectors
    rangeMinSelector = "input[name*='range[min]']",
    rangeMaxSelector = "input[name*='range[max]']",
    rangeGrpSelector = "input[name*='range[group]']",
    rangesPanel = '.diagnostic-feedback .ranges_panel',
    grpSelector = '.group',
    rangeSelector = '.range';

  if (typeof gettext == "undefined") {
    window.gettext = function gettext_stub(string) {
      return string;
    };
    window.ngettext = function ngettext_stub(strA, strB, n) {
      return n == 1 ? strA : strB;
    };
  }

  validatorObj.validateMinMax = function (range) {
    // validate each range for
    // if any range having min_value > max_value
    // check if ranges values are int OR float
    // return true/false
    var valid = true;

    var rangeMinValue = $(range).find(rangeMinSelector).val();
    var rangeMaxValue = $(range).find(rangeMaxSelector).val();
    if (rangeMinValue != "" && isNaN(parseFloat(rangeMinValue))) {
      valid = false;
      common.showMessage({success: valid, msg: gettext('Range Min value must be float')});
    } else if (rangeMaxValue != "" && isNaN(parseFloat(rangeMaxValue))) {
      valid = false;
      common.showMessage({success: valid, msg: gettext('Range Max value must be float')});
    } else if (rangeMinValue != "" && rangeMaxValue != "" && parseFloat(rangeMaxValue) <= parseFloat(rangeMinValue)) {
      valid = false;
      common.showMessage({success: valid, msg: gettext('Min value must be < Max')});
    }
    return valid;
  };


  validatorObj.validateViaSimpleComparisons = function (range) {
    // validate if any two ranges are overlapping
    var valid = true,
      range1MinValue = parseFloat($(range).find(rangeMinSelector).val()),
      range1MaxValue = parseFloat($(range).find(rangeMaxSelector).val()),
      range1Group = $(range).find(rangeGrpSelector).val();

    range1Group = range1Group ? range1Group : initData.DEFAULT_GROUP;
    var nextRanges = $(range).parents(grpSelector).nextAll(grpSelector).find(rangeSelector);


    $.each(nextRanges, function (n, nextRange) {
      var range2MinValue = parseFloat($(nextRange).find(rangeMinSelector).val()),
        range2MaxValue = parseFloat($(nextRange).find(rangeMaxSelector).val()),
        range2Group = $(nextRange).find(rangeGrpSelector).val(),

      //overlap = range1.min <= range2.max && range2.min <= range1.max;
        overlap = range1Group == range2Group && range1MinValue <= range2MaxValue && range2MinValue <= range1MaxValue;

      // check if both ranges are overlapping
      if (overlap) {
        valid = false;
        common.showMessage({
          success: valid, msg: gettext('Overlapping ranges found in "') + range1Group +'" ['
          + range1MinValue + "-" + range1MaxValue + "] & [" + range2MinValue + "-" + range2MaxValue + "]"
        });
        return valid;
      }
    });
    return valid;
  };


  validatorObj.validateDiagnosticQuizStep2 = function () {
    // validate step 2 of diagnostic quiz
    // validate for min/max AND overlapping

    var valid = true;
    $.each($(rangesPanel + ' ' + rangeSelector, element), function (r, range) {
      if (!validatorObj.validateMinMax(range)) {
        valid = false;
        return valid;
      } else if (!validatorObj.validateViaSimpleComparisons(range)) {
        valid = false;
        return valid;
      }
    });

    return valid;
  };

  validatorObj.isExistInRanges = function (answer, ranges) {
    // check if answer sum exist in any ranges defined at step 2

    var valid = false;
    var answerSum = answer.sum.toFixed(1);

    $.each(ranges, function (j, range) {
      if (answerSum >= parseFloat(range.min_value) && answerSum <= parseFloat(range.max_value)) {
        valid = true;
        return false;
      }
    });

    return valid;
  };

  validatorObj.validateDiagnosticQuizStep3 = function () {
    // validate step 3 of diagnostic quiz
    var valid = true;

    //get list of all choices for each question (it must be array of arrays)
    var allQuestionGroupsChoices = studioCommon.getAllWQuestionsChoices();

    $.each(allQuestionGroupsChoices, function(group, allGroupChoices){
      // generate all possible answers combinations for a quiz group
      var allPossibleAnswers = studioCommon.allPossibleAnswers(allGroupChoices);
      var ranges = studioCommon.getGroupRanges(group);
      // validate each answer combination if its sum exist in any range defined at step 2
      $.each(allPossibleAnswers, function (i, answer) {
        var existInRange = validatorObj.isExistInRanges(answer, ranges);
        if (!existInRange) {
          // return false if answer sum not exists in any range
          valid = false;
          showInvalidChoiceValueWarning.warningGroup = group;
          return valid;
        }
      });
      return valid;
    });

    return valid;
  };

  validatorObj.customStepValidation = function (step) {
    // custom validation for each wizard step
    var valid = true;

    var type = studioCommon.getQuizType();
    if (step == 2 && type == "DG") {
      valid = validatorObj.validateDiagnosticQuizStep2();
    }
    else if (step == 3 && type == "DG") {
      valid = validatorObj.validateDiagnosticQuizStep3();
      if (!valid) {
        valid = true;
        showInvalidChoiceValueWarning.showWarning = true;
      }
    }
    return valid;
  };
}