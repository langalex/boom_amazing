var couchapp = null;
$.CouchApp(function(app) {
  couchapp = app;
});
var content = $('#content');


var sammy = $.sammy(function() { with(this) {
  element_selector = '#content';
}});

canvas = null;

$(function() {
  //canvas = Raphael('content', 800, 600);
  //var circle = canvas.circle(50, 40, 10);
  // Sets the fill attribute of the circle to red (#f00)
  //circle.attr("fill", "#f00");
  // Sets the stroke attribute of the circle to white (#fff)
  //circle.attr("stroke", "#fff");
  //circle.animate({cx: 20, r: 20}, 2000);


  $('#content').svg({loadURL: './talk.svg', onLoad: function(_svg) {
    canvas = _svg;
    var all = $('svg *');
    all.remove();
    group = canvas.group(canvas.root(), {'trasnform': 'translate(50,50)'});
    $(group).append(all);
    
    var scale = 1, rotate = 0, rot_x = 0, rot_y = 0, translate_x = 0, translate_y = 0;
    var previouse_mouse_x = null, previouse_mouse_y = null;
    var mouse_down = false;
    var key_down = null;
    
    var update_canvas = function() {
      canvas.change(group, {'transform': 'translate(' + translate_x + ',' + translate_y + '), rotate(' + rotate + ') scale(' + scale + ' ' + scale + ')'});
    };
    
    var translate = function(delta_x, delta_y) {
      translate_x += delta_x;
      translate_y += delta_y;
    };
    
    var do_scale = function(delta_x, delta_y) {
      scale += delta_y / 100.0;
    };
    
    $('html').keydown(function(_event) {
      if(event.altKey) {
        key_down = 'scale';
      }
    });
    
    $('html').keyup(function(event) {
      key_down = null;
    });
    
    $('#rotate_left').click(function() {
      rotate -= 1;
      update_canvas();
    });
    
    $('#rotate_right').click(function() {
      rotate += 1;
      update_canvas();
    });
    
    $('#content').mousedown(function(event) {
      mouse_down = true;
    });
    
    $('#content').mouseup(function(event) {
      mouse_down = false;
    });
    
    $('#content').mousemove(function(event) {
      if(previouse_mouse_x != null) {
        var delta_x = event.clientX - previouse_mouse_x;
        var delta_y = event.clientY - previouse_mouse_y;
        if(key_down == null && mouse_down) {
          translate(delta_x, delta_y);
        } else if(key_down == 'scale') {
          do_scale(delta_x, delta_y);
        };
        update_canvas();
      }
      previouse_mouse_x = event.clientX;
      previouse_mouse_y = event.clientY;
    });
    
  }});
  
  // var svg = $('#content').svg('get');
  //sammy.run('#/');
});
