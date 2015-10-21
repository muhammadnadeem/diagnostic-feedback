function Setting(runtime, element){
    // global settings for js code
    var setting = this;

    setting.debug = true;
    setting.jsValidation = false;
    setting.tinyMceAvailable = (typeof $.fn.tinymce !== 'undefined'); // check if Studio includes a copy of tinyMCE and its jQuery plugin
}
