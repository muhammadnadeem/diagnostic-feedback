
function CustomValidator(runtime, element){
    var validatorObj = this;
    var studioCommon = new StudioCommon();
    var common = new Common();

    validatorObj.validateMinMax = function(range){
        var valid = true;

        var range_min_value = $(range).find("input[name^='range[min]']").val();
        var range_max_value = $(range).find("input[name^='range[max]']").val();
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
        var range = [];
        for ( var i=start, l=end; i.toFixed(1)<=l; i+=
            0.1 ){
            range.push(i.toFixed(1));
        }
        return range;
    }

    validatorObj.validateOverlappingRanges = function(range){

        // validate overlapping ranges
        var valid = true;
        var range1_min_value = parseFloat($(range).find("input[name^='range[min]']").val());
        var range1_max_value = parseFloat($(range).find("input[name^='range[max]']").val());
        var nextRanges = $(range).nextAll('.range');
        $.each(nextRanges, function(n, next_range){
            var range2_min_value = parseFloat($(next_range).find("input[name^='range[min]']").val());
            var range2_max_value = parseFloat($(next_range).find("input[name^='range[max]']").val());

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

        var valid = true;
        $.each($('#ranges_panel .range'), function(r, range){
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
        var valid = true;

        var allQuestionsChoices = studioCommon.getAllWQuestionsChoices();
        var allPossibleAnswers = studioCommon.allPossibleAnswers(allQuestionsChoices);
        var step2Data = studioCommon.getStepData(2);
        var ranges = step2Data.ranges;

        $.each(allPossibleAnswers, function(i, answer){
            var existInRange = validatorObj.isExistInRanges(answer, ranges);
            if (!existInRange) {
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