var Screen = function(canvas) {
  var animating = false,
    animationSteps = 10,
    
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
      var x_interpolator = Interpolator(last_transformation.translate_x, current_transformation.translate_x, animationSteps),
        y_interpolator = Interpolator(last_transformation.translate_y, current_transformation.translate_y, animationSteps);
        rotation_interpolator = Interpolator(last_transformation.rotate, current_transformation.rotate, animationSteps);
        scale_interpolator = Interpolator(last_transformation.scale, current_transformation.scale, animationSteps);

      animating = true;
      var animator = window.setInterval(function() {
        var done = x_interpolator.is_done() && y_interpolator.is_done() && rotation_interpolator.is_done() && scale_interpolator.is_done();

        transform_canvas(x_interpolator.next(), y_interpolator.next(), rotation_interpolator.next(), scale_interpolator.next());

        if(done) {
          window.clearInterval(animator);
          animating = false;
        };
      }, 5);

    } else {
      transform_canvas(
        current_transformation.translate_x,
        current_transformation.translate_y,
        current_transformation.rotate,
        current_transformation.scale
      );
    };
  };

  function transform_canvas(x, y, rotation, scale) {
    var transformations = [
      'translate(' + [parseInt(x, 10) + 'px',
                      parseInt(y, 10)] + 'px)',
      'rotate(' + rotation + 'deg' + ')',
      'scale(' + scale + ')'
    ];
    canvas.css('-webkit-transform', transformations.join(' '));
    canvas.css('-webkit-transform-origin', (canvas.width()/2 - x) + 'px ' + (canvas.height()/2 - y) + 'px');
    last_transformation = {
      translate_x: x,
      translate_y: y,
      rotate: rotation,
      scale: scale
    };
  };

  var screen = {
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
    is_animating: function() {
      return animating;
    },
    load_presentation: function(path) {
      if(path.match(/\.svg/)) {
        canvas.svg({loadURL: path});
      } else {
        canvas.css('background-image', 'url(' + path + ')');
        var img = $('<img src="' + path + '"/>').get(0);
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