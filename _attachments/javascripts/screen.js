var Screen = {
  init: function(selector, svg_file, callback) {
    var that = this;
    $(selector).svg({loadURL: svg_file, onLoad: function(_svg) {
      var canvas = _svg;
      
      var all = $('svg *');
      all.remove();
      var group = canvas.group(canvas.root());
      $(group).append(all);
      
      var _screen = {
        scale: 1, 
        rotate: 0,
        rot_x: 0,
        rot_y: 0,
        translate_x: 0,
        translate_y: 0,
        update_canvas: function() {
          that.update_canvas(canvas, group, _screen, true);
        },
        to_json: function() {
          return {
            scale: this.scale, 
            rotate: this.rotate,
            translate_x: this.translate_x,
            translate_y: this.translate_y
          }
        }
      };

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
      
      $(selector).mousedown(function(event) {
        mouse_down = true;
      });
      
      $(selector).mouseup(function(event) {
        mouse_down = false;
      });

      $(selector).mousemove(function(event) {
        if(this.animating) {
          return;
        }
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
        };
        previouse_mouse_x = event.clientX;
        previouse_mouse_y = event.clientY;
      });
      if(callback) {
        callback(_screen);
      }
    }});
  },
  
  last_transformation: {
    translate_x: 0,
    translate_y: 0,
    rotate: 0,
    scale: 1
  },
    
  update_canvas: function(canvas, group, _screen, animate) {
    if(animate) {
      var interpolator = function(old_value, target_value) {
        var distance = old_value - target_value;
        if(distance < 0) { // make the number a bit bigger for cases where the number is so small it would be rounded town to zero when being divided by 50 below
          distance -= 0.01;
        } else {
          distance += 0.01;
        }
        var new_value = old_value;
        return {
          next: function() {
            if(this.is_done()) {
              return new_value;
            };
            new_value = new_value - distance / 20;
            return new_value;
          },
          is_done: function() {
            return distance == 0 || (distance > 0 && target_value >= new_value) || (distance < 0 && target_value <= new_value);
          }
        };
      }
      
      var x_interpolator = interpolator(this.last_transformation.translate_x, _screen.translate_x);
      var y_interpolator = interpolator(this.last_transformation.translate_y, _screen.translate_y);
      var rotation_interpolator = interpolator(this.last_transformation.rotate, _screen.rotate);
      var scale_interpolator = interpolator(this.last_transformation.scale, _screen.scale);
      
      var that = this;
      this.animating = true;
      var animator = window.setInterval(function() {
        var done = x_interpolator.is_done() && y_interpolator.is_done() && rotation_interpolator.is_done() && scale_interpolator.is_done();
        
        that.transform_canvas(canvas, group, _screen, x_interpolator.next(), y_interpolator.next(), rotation_interpolator.next(), scale_interpolator.next());
        
        if(done) {
          window.clearInterval(animator);
          that.animating = false;
        };
      }, 5);
      
    } else {
      this.transform_canvas(canvas, group, _screen, _screen.translate_x, _screen.translate_y, _screen.rotate, _screen.scale)
    };
  },
  
  transform_canvas: function(canvas, group, _screen, x, y, rotation, scale) {
    canvas.change(group, {'transform': 'translate(' + x + ',' + y + '), rotate(' + rotation + ') scale(' + scale + ' ' + scale + ')'});
    this.last_transformation = {
      translate_x: x,
      translate_y: y,
      rotate: rotation,
      scale: scale
    }
  },

  do_translate: function(delta_x, delta_y, _screen) {
    _screen.translate_x += delta_x * 4;
    _screen.translate_y += delta_y * 4;
  },

  do_scale: function(delta_x, delta_y, _screen) {
    _screen.scale += delta_y / 100.0;
  },

  do_rotate: function(delta_x, delta_y, _screen) {
    _screen.rotate += delta_x / 5.0;
  }
}