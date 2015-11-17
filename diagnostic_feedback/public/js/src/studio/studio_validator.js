
function CustomValidator(runtime, element){
    // contains all additional validation logic for wizard steps
    showInvalidChoiceValueWarning = false;

    var validatorObj = this,
        studioCommon = new StudioCommon(),
        common = new Common(),

        //selectors
        rangeMinSelector = "input[name^='range[min]']",
        rangeMaxSelector = "input[name^='range[max]']",
        rangesPanel = '.diagnostic-feedback #ranges_panel',
        rangeSelector = '.range';


    validatorObj.validateMinMax = function(range){
        // validate each range for
        // if any range having min_value > max_value
        // check if ranges values are int OR float
        // return true/false
        var valid = true;

        var rangeMinValue = $(range).find(rangeMinSelector).val();
        var rangeMaxValue = $(range).find(rangeMaxSelector).val();
        if (rangeMinValue != "" && isNaN(parseFloat(rangeMinValue))) {
            valid = false;
            common.showMessage({success: valid, msg: 'Range Min value must be float'});
        } else if (rangeMaxValue != "" && isNaN(parseFloat(rangeMaxValue))) {
            valid = false;
            common.showMessage({success: valid, msg: 'Range Max value must be float'});
        } else if (rangeMinValue != "" && rangeMaxValue != "" && parseFloat(rangeMaxValue) <= parseFloat(rangeMinValue)) {
            valid = false;
            common.showMessage({success: valid, msg: 'Min value must be < Max'});
        }
        return valid;
    };

    validatorObj.makeRangeArray = function(start, end) {
        // return float array from start to end with step = 0.1
        var range = [];
        var step = 0.1;

        for ( var i=start, l=end; i.toFixed(1)<=l; i+=
             step){
            range.push(i.toFixed(1));
        }
        return range;
    };

    validatorObj.validateViaArraysComparisions = function(range){
        // validate if any two ranges are overlapping

        var valid = true;
        var range1MinValue = parseFloat($(range).find(rangeMinSelector).val());
        var range1MaxValue = parseFloat($(range).find(rangeMaxSelector).val());
        var nextRanges = $(range).nextAll(rangeSelector);
        $.each(nextRanges, function(n, nextRange){
            var range2MinValue = parseFloat($(nextRange).find(rangeMinSelector).val());
            var range2MaxValue = parseFloat($(nextRange).find(rangeMaxSelector).val());

            var range1 = validatorObj.makeRangeArray(range1MinValue, range1MaxValue);
            var range2 = validatorObj.makeRangeArray(range2MinValue, range2MaxValue);

            // check if both ranges are overlapping
            if($(range1).filter(range2).length > 0) {
                valid = false;
                common.showMessage({success: valid, msg: 'Overlapping ranges found ['
                + range1MinValue + "-" + range1MaxValue + "] & [" + range2MinValue+ "-" + range2MaxValue + "]"});
                return valid;
            };
        });
        return valid;
    };

    validatorObj.validateViaSimpleComparisons = function(range){
        // validate if any two ranges are overlapping

        var valid = true,
        range1MinValue = parseFloat($(range).find(rangeMinSelector).val()),
        range1MaxValue = parseFloat($(range).find(rangeMaxSelector).val()),
        nextRanges = $(range).nextAll(rangeSelector);

        $.each(nextRanges, function(n, nextRange){
            var range2MinValue = parseFloat($(nextRange).find(rangeMinSelector).val()),
            range2MaxValue = parseFloat($(nextRange).find(rangeMaxSelector).val()),

            //overlap = range1.min <= range2.max && range2.min <= range1.max;
            overlap = range1MinValue <= range2MaxValue && range2MinValue <= range1MaxValue;

            // check if both ranges are overlapping
            if(overlap) {
                valid = false;
                common.showMessage({success: valid, msg: 'Overlapping ranges found ['
                + range1MinValue + "-" + range1MaxValue + "] & [" + range2MinValue+ "-" + range2MaxValue + "]"});
                return valid;
            }
        });
        return valid;
    };


    validatorObj.validateDiagnosticQuizStep2 = function(){
        // validate step 2 of diagnostic quiz
        // validate for min/max AND overlapping

        var valid = true;
        $.each($(rangesPanel + ' ' + rangeSelector), function(r, range){
            if(!validatorObj.validateMinMax(range)) {
                valid = false;
                return valid;
            } else if(!validatorObj.validateViaSimpleComparisons(range)){
                valid = false;
                return valid;
            }
        });

        return valid;
    };

    validatorObj.isExistInRanges = function(answer, ranges){
        // check if answer sum exist in any ranges defined at step 2

        var valid = false;

        $.each(ranges, function(j, range){
            if(answer.sum >= parseFloat(range.min_value) && answer.sum <= parseFloat(range.max_value)){
                valid = true;
                return false;
            }
        });

        return valid;
    };

    validatorObj.validateDiagnosticQuizStep3 = function(){
        // validate step 3 of diagnostic quiz
        var valid = true;

        //get list of all choices for each question (it must be array of arrays)
        var allQuestionsChoices = studioCommon.getAllWQuestionsChoices();

        // generate all possible answers combinations for a quiz
        var allPossibleAnswers = studioCommon.allPossibleAnswers(allQuestionsChoices);

        var step2Data = studioCommon.getStepData(2);
        var ranges = step2Data.ranges;

        // validate each answer combination if its sum exist in any range defined at step 2
        $.each(allPossibleAnswers, function(i, answer){
            var existInRange = validatorObj.isExistInRanges(answer, ranges);
            if (!existInRange) {
                // return false if answer sum not exists in any range
                valid = false;
                return valid;
            }
        });
        return valid;
    };

    validatorObj.customStepValidation =  function(step) {
        // custom validation for each wizard step
        var valid = true;
        var type = studioCommon.getQuizType();
        if (step == 2 && type == "DG") {
            valid = validatorObj.validateDiagnosticQuizStep2();
        }
        else if (step == 3 && type == "DG") {
            valid = validatorObj.validateDiagnosticQuizStep3();

            if(!valid){
                valid = true;
                showInvalidChoiceValueWarning = true;
            }
        }
        return valid;
    };
}