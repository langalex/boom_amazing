$(function() {
  var store = null,
    screen_node = $('#screen'),
    screen = null;
    
  $.CouchApp(function(couchapp) {
    store = Store(couchapp);
  });
  
  helpers.init_toolbar();
  helpers.init_keyboard_controls();
  helpers.load_presentations(store);
  helpers.init_screen_display(screen_node);
  helpers.load_presentation();
  
  screen = Screen(screen_node);
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
        var transformation = slide.transformation;
        screen.transform_to(transformation);
        $('#current_slide').text(slide_number);
        $('#next_link').attr('href', '#/slides/' + (slide_number + 1));
        $('#previous_link').attr('href', '#/slides/' + (slide_number > 1 ? slide_number - 1 : 1));
        store.save_slide_view(slide);
      });
    });
    
    this.get('#/slide_views/:number', function(context) {
      var slide_view_number = parseInt(context.params['number'], 10);
      store.slide_views(slide_view_number, 2, function(slide_view, next_slide_view) {
        store.slide(slide_view.slide_id, function(slide) {
          screen.transform_to(slide.transformation);
        });
        var last_view_time = context.last_view_time || new Date();
        window.setTimeout(function() {
          location.hash = '/slide_views/' + (slide_view_number + 1);
        }, new Date(next_slide_view.created_at) - new Date(slide_view.created_at) - (new Date() - last_view_time));
      });
      this.last_view_time = new Date();
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
  sammy.run();
  
  $(window).bind('presentations-loaded', function() {
    sammy.trigger('init');
  });
  
});
  
