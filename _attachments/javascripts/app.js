$(function() {
  var store = null,
    screen_node = $('#screen'),
    screen = null,
    audience_display = null;
    
  $.CouchApp(function(couchapp) {
    store = Store(couchapp);
  });
  
  screen = Screen(screen_node);
  
  helpers.init_toolbar();
  helpers.init_keyboard_controls();
  helpers.load_presentations(store);
  helpers.init_screen_display(screen_node);
  helpers.load_presentation(screen);
  
  bind_controls(screen);

  var sammy = $.sammy(function() {
    this.element_selector = '#toolbar';
    this.initialized = false;
    
    this.helpers({
      current_presentation_id: function() {
        return $('#presentation').val() + '/' + $('#presentation :selected').text();
      }
    });
    
    this.get('#/slides/:number', function(context) {
      var slide_number = parseInt(context.params['number'], 10);
      store.slide_by_number(context.current_presentation_id(), slide_number, function(slide) {
        screen.transform_to(slide.transformation);
        $('#current_slide').text(slide_number);
        $('#next_link').attr('href', '#/slides/' + (slide_number + 1));
        $('#previous_link').attr('href', '#/slides/' + (slide_number > 1 ? slide_number - 1 : 1));
      });
      if(audience_display !== null) {
        audience_display.location.href = location.href;
      };
    });
    
    this.post('#/slides', function(context) {
      var slide = {type: 'Slide', transformation: screen.to_json(), created_at: new Date().toJSON(), presentation_id: context.current_presentation_id()};
      store.save_slide(slide, function() {
        $('#slide_count').text(parseInt($('#slide_count').text(), 10) + 1);
        $('#current_slide').text($('#slide_count').text());
      });
      return false;
    });
    
    this.bind('init', function() {
      if(!this.initialized) {
        store.slide_count(this.current_presentation_id(), function(count) {
          $('#slide_count').text(count);
        });
      };
      this.initialized = true;
    });

  });
  
  $(window).bind('presentations-loaded', function() {
    sammy.run();
    sammy.trigger('init');
    
    $('#presenter_display_link').live('click', function(e) {
      e.preventDefault();
      if(audience_display === null) {
        audience_display = window.open(location.href, 'audience_display', 'location=no,menubar=no,status=no,toolbar=no,titlebar=no');
        screen.scale_factor(0.5);
        $('#presenter_overlay')
          .css('margin-top', '-' + $('#screen').height() + 'px')
          .show();
      };
    });
  });
  
});
  
