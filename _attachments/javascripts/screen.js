var Screen = function(canvas) {
  var animating = false,
    scale_factor = 1,
    
    current_transformation = {
      scale: 1, 
      rotate: 0,
      translate_x: 0,
      translate_y: 0
    },
    last_transformation = {
      translate_x: 0,
      translate_y: 0,
      rotate: 0,
      scale: 1
    };
    
  function update_canvas(animate) {
    if(animate) {
      canvas.css('-webkit-transition', 'all 0.5s linear').css('-moz-transition', 'all 0.5s linear').css('-o-transition', 'all 0.5s linear')
    } else {
      canvas.css('-webkit-transition', '').css('-moz-transition', '').css('-o-transition', '')
    };
    transform_canvas(
      current_transformation.translate_x,
      current_transformation.translate_y,
      current_transformation.rotate,
      current_transformation.scale
    );
  };

  function transform_canvas(x, y, rotation, scale) {
    var transformations = [
      'translate3d(' + [parseInt(x, 10) + 'px',
                      parseInt(y, 10)] + 'px, 0px)',
      'rotate(' + rotation + 'deg' + ')',
      'scale(' + scale * scale_factor + ')'
    ];
    canvas.css('-webkit-transform', transformations.join(' '));
    canvas.css('-webkit-transform-origin', (1024/2 - x) + 'px ' + (768/2 - y) + 'px');
    last_transformation = {
      translate_x: x,
      translate_y: y,
      rotate: rotation,
      scale: scale
    };
  };

  var screen = {
    scale_factor: function(factor) {
      scale_factor = factor;
      update_canvas(true);
    },
    
    translate: function(delta_x, delta_y) {
      current_transformation.translate_x += (delta_x / current_transformation.scale);
      current_transformation.translate_y += (delta_y / current_transformation.scale);
      update_canvas();
    },

    scale: function(delta_x, delta_y) {
      var delta_scale = delta_y / -100.0 * current_transformation.scale;
      current_transformation.scale += delta_scale;
      update_canvas();
    },

    rotate: function(delta_x, delta_y) {
      current_transformation.rotate += delta_x / 5.0;
      update_canvas();
    },
    to_json: function() {
      return current_transformation;
    },
    transform_to: function(target_transformation) {
      current_transformation = target_transformation;
      update_canvas(true);
    },
    load_presentation: function(path) {
      if(path.match(/\.svg/)) {
        canvas.svg({loadURL: path});
      } else {
        canvas.html('<img src="' + path + '"/>');
        var img = canvas.find('img').get(0);
        var interval = window.setInterval(function() {
          if(img_loaded()) {
            canvas.width(img.width).height(img.height);
            window.clearInterval(interval);
          };
          
          function img_loaded() {
            return img.width > 0;
          }
        }, 10);
      };
    }
  };

  return screen;
};