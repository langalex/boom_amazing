var Screen = {
  init: function(selector, svg_file) {
    var that = this;
    $(selector).svg({loadURL: svg_file, onLoad: function(_svg) {
      var canvas = _svg,
      var _screen = {
        scale: 1, 
        rotate: 0,
        rot_x: 0,
        rot_y: 0,
        translate_x: 0,
        translate_y: 0
      };

      var all = $('svg *');
      all.remove();
      var group = canvas.group(canvas.root());
      $(group).append(all);
      
      var previouse_mouse_x = null, previouse_mouse_y = null;
      var mouse_down = false;
      var key_down = null;

      $('html').keydown(function(_event) {
        if(event.altKey) {
          key_down = 'scale';
        }
        if(event.ctrlKey) {
          key_down = 'rotate';
        }
      });

      $('html').keyup(function(event) {
        key_down = null;
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
          if(!key_down && mouse_down) {
            that.do_translate(delta_x, delta_y, _screen);
          } else if(key_down == 'scale') {
            that.do_scale(delta_x, delta_y, _screen);
          } else if(key_down == 'rotate') {
            that.do_rotate(delta_x, delta_y, _screen);
          };
          that.update_canvas(canvas, group, _screen);
        }
        previouse_mouse_x = event.clientX;
        previouse_mouse_y = event.clientY;
      });
      return _screen;
    }});
  },
    
  update_canvas: function(canvas, group, _screen) {
    canvas.change(group, {'transform': 'translate(' + _screen.translate_x + ',' + _screen.translate_y + '), rotate(' + _screen.rotate + ') scale(' + _screen.scale + ' ' + _screen.scale + ')'});
  },

  do_translate: function(delta_x, delta_y, _screen) {
    _screen.translate_x += delta_x;
    _screen.translate_y += delta_y;
  },

  do_scale: function(delta_x, delta_y, _screen) {
    _screen.scale += delta_y / 200.0;
  },

  do_rotate: function(delta_x, delta_y, _screen) {
    _screen.rotate += delta_x / 5.0;
  }
}