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
  
  var couchapp = null;
  $.CouchApp(function(app) {
    couchapp = app;
  });
  
  couchapp.design.view('presentations', {
    success: function(json) {
      for(var i in json['rows']) {
        var presentation = json['rows'][i];
        $('#presentation').append('<option value="' + presentation.id + '">' + presentation.value + '</option>');
      }
    }
  });
  
  $('#presentation').change(function() {
    location.href = location.pathname + '?svg=../../' + $(this).val() + '/' + $(this).text();
  });
  
  var svg_path = window.location.href.match(/svg=(.+\.svg)/);
  if(svg_path == null) {
    $('#screen').html('<div class="notice">Plese select an svg from the list in the toolbar. If there is none attach one to any document.</div>');
    return;
  } else {
    svg_path = svg_path[1];
  };

  var _screen = null;
  Screen.init('#screen', svg_path, function(__screen) {
    _screen = __screen;
  });

  var sammy = $.sammy(function() { with(this) {
    element_selector = '#controls';
    initialized = false;
    
    get('#/slides/:number', function() { with(this) {
      var slide_number = parseInt(params['number']);
      couchapp.design.view('slides', {
        reduce: false,
        include_docs: true,
        limit: 1,
        skip: slide_number - 1,
        success: function(json) {
          var slide = json['rows'][0]['doc'];
          var transformaton = slide['transformation'];
          for(var i in transformaton) {
            _screen[i] = transformaton[i];
          };
          _screen.update_canvas();
          $('#current_slide').text(slide_number);
          $('#next_link').attr('href', '#/slides/' + (slide_number + 1));
          $('#previous_link').attr('href', '#/slides/' + (slide_number > 1 ? slide_number - 1 : 1));
          couchapp.db.saveDoc({
              type: 'SlideView',
              created_at: new Date().toJSON(),
              slide_id: slide._id
            }, {
            success: function(json) {
            }
          });
        }
      })
    }});
    
    get('#/slide_views/:number', function() { with(this) {
      var context = this;
      var slide_view_number = parseInt(params['number']);
      couchapp.design.view('slide_views', {
        include_docs: true,
        limit: 2,
        skip: slide_view_number - 1,
        success: function(json) {
          var slide_view = json['rows'][0]['doc'];
          var next_slide_view = json['rows'][1]['doc'];
          var slide = couchapp.db.openDoc(slide_view.slide_id, {
            success: function(slide) {
              var transformation = slide['transformation'];
              for(var i in transformation) {
                _screen[i] = transformation[i];
              };
              _screen.update_canvas();
            }
          });
          var last_view_time = context.last_view_time || new Date();
          window.setTimeout(function() {
            location.hash = '/slide_views/' + (parseInt(slide_view_number) + 1);
          }, new Date(next_slide_view.created_at) - new Date(slide_view.created_at) - (new Date() - last_view_time));
        }
      });
      this.last_view_time = new Date();
    }});
    
    post('#/slides', function() { with(this) {
      var slide = {type: 'Slide', transformation: _screen.to_json(), created_at: new Date().toJSON()};
      couchapp.db.saveDoc(slide, {
        success: function() {
          $('#slide_count').text(parseInt($('#slide_count').text()) + 1);
          $('#current_slide').text($('#slide_count').text());
        },
        error: function(response_code, json) {
          trigger('error', {message: "Error Saving Slide: " + json});
        }
      });
      return false;
    }});
    
    before(function() {
      $('#log').html('');
    });
    
    bind('init', function() { with(this) {
      if(!initialized) {
        couchapp.design.view('slides', {
          success: function(json) {
            var count = null;
            if(json['rows'][0]) {
              count = json['rows'][0]['value']
            } else {
              count = 0;
            };
            $('#slide_count').text(count);
          }
        });
      };
      initialized = true;
    }});

    bind('error', function(e, data) { with(this) {
      $('#log').html(data.message);
    }});

    bind('notice', function(e, data) { with(this) {
      $('#log').html(data.message);
    }});
  }});
  sammy.run();
  sammy.trigger('init');
});
  
