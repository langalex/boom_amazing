var Screen = {
  init: function(selector, svg_file, callback) {
    this.screen = {};
    this.canvas = null;
    var that = this;
    $(selector).svg({loadURL: svg_file, onLoad: function(_svg) {
      that.canvas = $(selector);
      
      $.extend(that.screen, {
		    animationSteps: 10,
        scale: 1, 
        rotate: 0,
        rot_x: 0,
        rot_y: 0,
        translate_x: 0,
        translate_y: 0,
        update_canvas: function() {
          that.update_canvas(true);
        },
        to_json: function() {
          return {
            scale: this.scale, 
            rotate: this.rotate,
            translate_x: this.translate_x,
            translate_y: this.translate_y
          }
        }
      });

      if(callback) {
        callback(that);
      }
    }});
    this.container = $(selector + ' svg');
  },
  
  last_transformation: {
    translate_x: 0,
    translate_y: 0,
    rotate: 0,
    scale: 1
  },
    
  update_canvas: function(animate) {
    if(animate) {
      var x_interpolator = interpolator(this.last_transformation.translate_x, this.screen.translate_x, this.screen.animationSteps);
      var y_interpolator = interpolator(this.last_transformation.translate_y, this.screen.translate_y, this.screen.animationSteps);
      var rotation_interpolator = interpolator(this.last_transformation.rotate, this.screen.rotate, this.screen.animationSteps);
      var scale_interpolator = interpolator(this.last_transformation.scale, this.screen.scale, this.screen.animationSteps);
      
      var that = this;
      this.animating = true;
      var animator = window.setInterval(function() {
        var done = x_interpolator.is_done() && y_interpolator.is_done() && rotation_interpolator.is_done() && scale_interpolator.is_done();
        
        that.transform_canvas(x_interpolator.next(), y_interpolator.next(), rotation_interpolator.next(), scale_interpolator.next());
        
        if(done) {
          window.clearInterval(animator);
          that.animating = false;
        };
      }, 5);
      
    } else {
      this.transform_canvas(
        this.screen.translate_x,
        this.screen.translate_y,
        this.screen.rotate,
        this.screen.scale
      )
    };
  },
  
  transform_canvas: function(x, y, rotation, scale) {
    // var centered_x = x * scale - (this.center_offset_x() * (scale - 1));
    // var centered_y = y * scale - (this.center_offset_y() * (scale - 1));
    var transformations = [
      'translate(' + [parseInt(x) + 'px',
                      parseInt(y)] + 'px)',
      'rotate(' + rotation + 'deg' + ')',
      'scale(' + scale + ')'
    ];
    this.canvas.css('-webkit-transform', transformations.join(' '));
    this.last_transformation = {
      translate_x: x,
      translate_y: y,
      rotate: rotation,
      scale: scale
    }
  },
  
  container_scale_factor: function() {
  	var factor = this.container.attr('viewBox').baseVal.width / this.container.width();
  	if(factor == 0) {
  		return 1
  	} else {
  		return factor;
  	};
  },
  
  center_offset_x: function() {
    return this.container.width() / 2.0 * this.container_scale_factor();
  },
  
  center_offset_y: function() {
    return this.container.height() / 2.0 * this.container_scale_factor();
  },
  
  do_translate: function(delta_x, delta_y) {
    this.screen.translate_x += delta_x / this.screen.scale;
    this.screen.translate_y += delta_y / this.screen.scale;
    this.update_canvas();
    
  },

  do_scale: function(delta_x, delta_y) {
    this.screen.scale += delta_y / -100.0 * this.screen.scale;
    this.update_canvas();
  },

  do_rotate: function(delta_x, delta_y) {
    this.screen.rotate += delta_x / 5.0;
    this.update_canvas();
  }
}