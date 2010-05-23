$(function() {
  
  var hideControls = true;
  $('#controls').mouseenter(function() {
    if(!$(this).data('original_top')) {
      $(this).data('original_top', $(this).css('top'));
    };
    hideControls = false;
    $(this).css('top', '0px');
  }).mouseleave(function(e) {
    var that = this;
    window.setTimeout(function() {
      if(hideControls) {
        $(that).css('top', $(that).data('original_top'));
      };
    }, 500);
    hideControls = true;
  });
  
  var store = null;
  $.CouchApp(function(couchapp) {
    store = Store(couchapp);
  });
  
  store.presentations(function(presentations) {
    for(var i in presentations) {
      var presentation = presentations[i];
      $('#presentation').append('<option value="' +
        presentation.id + '" ' + (
          location.href.match(presentation.id + '/' + presentation.name) ? 'selected="selected"' : '') +
          '>' + presentation.name + '</option>');
    };
    $(window).trigger('presentations-loaded');
  });
  
  $('#presentation').change(function() {
    location.href = location.pathname + '?presentation=../../' + $(this).val() + '/' + $(this).find(':selected').text();
  });
  
  var presentation_path = window.location.href.match(/presentation=(.+\.(?:svg|png|gif))/);
  if(presentation_path == null) {
    $('#screen').html('<div class="notice">Plese select a presentation from the list in the toolbar. If there is none attach one to any document.</div>');
    return;
  } else {
    presentation_path = presentation_path[1];
    $('title').text(presentation_path.split('/').reverse()[0] + ' - boom amazing');
  };

  $('#screen').svg({loadURL: presentation_path});
  var _screen = Screen('#screen');
  bind_controls(_screen);

  var sammy = $.sammy(function() {
    this.element_selector = '#controls';
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
        _screen.transform_to(transformation);
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
          _screen.transform_to(slide.transformation);
        });
        var last_view_time = context.last_view_time || new Date();
        window.setTimeout(function() {
          location.hash = '/slide_views/' + (slide_view_number + 1);
        }, new Date(next_slide_view.created_at) - new Date(slide_view.created_at) - (new Date() - last_view_time));
      });
      this.last_view_time = new Date();
    });
    
    this.post('#/slides', function(context) {
      var slide = {type: 'Slide', transformation: _screen.to_json(), created_at: new Date().toJSON(), presentation_id: context.current_presentation_id()};
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

  $('html').keydown(function(_event) {
	if(_event.keyCode == 32) {
		location.href = $('#next_link').attr('href');
	};
	if(_event.keyCode == 66) {
		location.href = $('#previous_link').attr('href');
	};
  });
  
  $(window).bind('presentations-loaded', function() {
    sammy.trigger('init');
  });
  
});
  
