function Common(runtime, element) {
    //contains common js b/w studio and student view
    var cObj = this,

        //selectors
        globalMessage = '.diagnostic-feedback .msg',
        warningMessage = '.diagnostic-feedback .validation-msg',
        visibleUserAnswer = '.diagnostic-feedback .user-answers:visible';

    cObj.clearErrors = function(){
        $('.validation-error-message').remove();
    };

    cObj.showValidationError = function(msgObj){
        $('<div class="validation-error-message">' + msgObj.msg + '<div>').insertBefore($(visibleUserAnswer).first());
    };

    cObj.showGlobalMessage = function(msgObj){
        // display message at top right of page
        var _type = '';
        var title = '';

        var msg = $(globalMessage).last();
        msg.removeClass('info-msg success-msg error-msg warning-msg');

        if (msgObj.success) {
            _type = 'success-msg';
            title = 'Success! ' + msgObj.msg;
        } else if (msgObj.warning){
            _type = 'warning-msg';
            title = 'Warning! ' + msgObj.msg;
        } else {
            _type = 'error-msg';
            title = 'Error! ' + msgObj.msg;
        }
        msg.addClass(_type);
        msg.find('h3').html(title);
        msg.slideDown('slow');

        if(!msgObj.persist) {
            setTimeout(function () {
                msg.slideUp('slow');
            }, 3000);
        }
    };

    cObj.showChildMessage = function(container, msgObj){
        // append message to given container
        var _type = '';
        var title = '';
        container.find(warningMessage).remove();

        if (msgObj.success) {
            _type = 'success-msg';
        } else if (msgObj.warning){
            _type = 'warning-msg';
        } else {
            _type = 'error-msg';
        }
        var html = '<div class="validation-msg '+_type+'"><h3>' + msgObj.msg + '</h3></div>';
        $(container).append(html);

        if(!msgObj.persist){
            setTimeout(function(){
                var target = container.find(warningMessage);
                target.hide('slow', function(){
                    target.remove();
                });
            }, 3000);
        }
    };

    cObj.showMessage = function(data, container) {
        // show messages at top of page or inside some container
        if (container) {
            cObj.showChildMessage(container, data);
        } else {
            cObj.showGlobalMessage(data);
        }
    };
}