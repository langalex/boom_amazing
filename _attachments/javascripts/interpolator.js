var interpolator = function(old_value, target_value, steps) {
  var distance = old_value - target_value;
  if(distance < 0) { // make the number a bit bigger for cases where the number is so small it would be rounded down to zero when being divided by 50 below
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
      new_value = new_value - distance / steps;
      return new_value;
    },
    is_done: function() {
      return distance == 0 || (distance > 0 && target_value >= new_value) || (distance < 0 && target_value <= new_value);
    }
  };
};