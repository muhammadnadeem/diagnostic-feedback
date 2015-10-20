
function CustomValidator(runtime, element){
    // contains all additional validation logic for wizard steps

    var validatorObj = this,
    studioCommon = new StudioCommon(),
    common = new Common(),

    //selectors
    rangeMinSelector = "input[name^='range[min]']",
    rangeMaxSelector = "input[name^='range[max]']",
    rangesPanel = '#ranges_panel',
    rangeSelector = '.range';


    validatorObj.validateMinMax = function(range){
        // validate each range for
        // if any range having min_value > max_value
        // check if ranges values are int OR float
        // return true/false
        var valid = true;

        var range_min_value = $(range).find(rangeMinSelector).val();
        var range_max_value = $(range).find(rangeMaxSelector).val();
        if (range_min_value != "" && isNaN(parseFloat(range_min_value))) {
            valid = false;
            common.showMessage({success: valid, msg: 'Range Min value must be float'});
        } else if (range_max_value != "" && isNaN(parseFloat(range_max_value))) {
            valid = false;
            common.showMessage({success: valid, msg: 'Range Max value must be float'});
        } else if (range_min_value != "" && range_max_value != "" && parseFloat(range_max_value) <= parseFloat(range_min_value)) {
            valid = false;
            common.showMessage({success: valid, msg: 'Min value must be < Max'});
        }
        return valid;
    }

    validatorObj.makeRangeArray = function(start, end) {
        // return float array from start to end with step = 0.1
        var range = [];
        var step = 0.1;

        for ( var i=start, l=end; i.toFixed(1)<=l; i+=
             step){
            range.push(i.toFixed(1));
        }
        return range;
    }

    // TO-DO test this logic for large ranges
    validatorObj.validateOverlappingRanges = function(range){
        // validate if any two ranges are overlapping

        var valid = true;
        var range1_min_value = parseFloat($(range).find(rangeMinSelector).val());
        var range1_max_value = parseFloat($(range).find(rangeMaxSelector).val());
        var nextRanges = $(range).nextAll(rangeSelector);
        $.each(nextRanges, function(n, next_range){
            var range2_min_value = parseFloat($(next_range).find(rangeMinSelector).val());
            var range2_max_value = parseFloat($(next_range).find(rangeMaxSelector).val());

            var range1 = validatorObj.makeRangeArray(range1_min_value, range1_max_value);
            var range2 = validatorObj.makeRangeArray(range2_min_value, range2_max_value);

            // check if both ranges are overlapping
            if($(range1).filter(range2).length > 0) {
                valid = false;
                common.showMessage({success: valid, msg: 'Overlapping ranges found ['
                + range1_min_value + "-" + range1_max_value + "] & [" + range2_min_value+ "-" + range2_max_value + "]"});
                return valid;
            };
        })
        return valid;
    }

    validatorObj.validateDiagnosticQuizStep2 = function(){
        // validate step 2 of diagnostic quiz
        // validate for min/max AND overlapping

        var valid = true;
        $.each($(rangesPanel + ' ' + rangeSelector), function(r, range){
            if(!validatorObj.validateMinMax(range)) {
                valid = false;
                return valid;
            } else if(!validatorObj.validateOverlappingRanges(range)){
                valid = false;
                return valid;
            }
        });

        return valid;
    }

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
    }

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
    }

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
                common.showMessage({
                    success: false,
                    warning: true,
                    persist: true,
                    msg: 'Some answer combinations may not belong to any result'
                }, $("section[step='3']").find('h3').first());
            }
        }
        return valid;
    }
}