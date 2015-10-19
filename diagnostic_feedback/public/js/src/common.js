function Common(runtime, element) {
    var cObj = this;

    cObj.showGlobalMessage = function(msgObj){
        var _type = '';
        var title = '';

        var msg = $('.msg');
        msg.removeClass('info success-msg error-msg warning-msg');

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

        setTimeout(function(){
            msg.slideUp('slow');
        }, 2000);
    }

    cObj.showChildMessage = function(container, msgObj){
        // append message to given container
        var _type = '';
        var title = '';
        container.find('.validation-msg').remove();

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
                var target = container.find('.validation-msg');
                target.hide('slow', function(){
                    target.remove();
                });
            }, 3000);
        }
    }

    cObj.showMessage = function(data, container) {
        // show messages at top of page or inside some container
        if (container) {
            cObj.showChildMessage(container, data);
        } else {
            cObj.showGlobalMessage(data);
        }
    }
}