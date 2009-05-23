var couchapp = null;
$.CouchApp(function(app) {
  couchapp = app;
});
var content = $('#content');

// var sammy = $.sammy(function() { with(this) {
//   element_selector = '#content';
// }});

canvas = null;

$(function() {
  Screen.init('#content', './talk.svg');
});
  
  //sammy.run('#/');
  //});
