function Setting(runtime, element, initData) {
  "use strict";

  // global settings for js code
  var setting = this;

  setting.debug = true;
  setting.jsValidation = true;
  setting.tinyMceAvailable = (typeof $.fn.tinymce !== 'undefined'); // check if Studio includes a copy of tinyMCE and its jQuery plugin
}
