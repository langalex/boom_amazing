helpers = {
  init_toolbar: function() {
    var hide_toolbar = true;
    $('#toolbar').mouseenter(function() {
      if(!$(this).data('original_top')) {
        $(this).data('original_top', $(this).css('top'));
      };
      hide_toolbar = false;
      $(this).css('top', '0px');
    }).mouseleave(function(e) {
      var that = this;
      window.setTimeout(function() {
        if(hide_toolbar) {
          $(that).css('top', $(that).data('original_top'));
        };
      }, 500);
      hide_toolbar = true;
    });
    $('#presentation').change(function() {
      location.href = location.pathname + '?presentation=../../' + $(this).val() + '/' + $(this).find(':selected').text();
    });
  },
  load_presentations: function(store) {
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
  },
  init_screen_display: function(screen_node) {
    if(!this.presentation_path()) {
      screen_node.html('<div class="notice">Plese select a presentation from the list in the toolbar. If there is none attach one to any document.</div>');
    } else {
      $('title').text(this.presentation_path().split('/').reverse()[0] + ' - boom amazing');
    };
  },
  load_presentation: function() {
    if(this.presentation_path()) {
      if(this.presentation_path().match(/\.svg/)) {
        $('#screen').svg({loadURL: this.presentation_path()});
      } else {
        $('#screen').css('background-image', 'url(' + this.presentation_path() + ')');
        var img = $('<img src="' + this.presentation_path() + '"/>').get(0);
        var interval = window.setInterval(function() {
          if(img_loaded()) {
            $('#screen').width(img.width).height(img.height);
            window.clearInterval(interval);
          };
          
          function img_loaded() {
            return img.width > 0;
          }
        }, 10);
        $('#screen').width(img.width).height(img.height);
      };
    };
  },
  presentation_path: function() {
    var match = window.location.href.match(/presentation=(.+\.(?:svg|png|gif))/);
    return match ? match[1] : null;
  },
  init_keyboard_controls: function() {
    $('html').keydown(function(_event) {
    	if(_event.keyCode == 32) {
    		location.href = $('#next_link').attr('href');
    	};
    	if(_event.keyCode == 66) {
    		location.href = $('#previous_link').attr('href');
    	};
    });
  }
};