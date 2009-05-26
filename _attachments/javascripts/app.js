$(function() {
  
  var svg_path = window.location.href.match(/svg=(.+\.svg)/)[1];
  if(svg_path == null) {
    alert('Plese specify the url of the svg file via the svg parameter');
    return;
  };
  
  var couchapp = null;
  $.CouchApp(function(app) {
    couchapp = app;
  });

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
              console.log('stored slideview: ', json)
            }
          });
        }
      })
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
  
