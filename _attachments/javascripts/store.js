Store = function(couchapp) {
  return {
    presentations: function(callback) {
      couchapp.design.view('presentations', {
        success: function(json) {
          var presentations = [];
          for(var i in json['rows']) {
            var presentation = {id: json['rows'][i].id, name: json['rows'][i].value};
            presentations.push(presentation);
          };
          callback(presentations);
        }
      });
    },
    slide: function(slide_id, callback) {
      couchapp.db.openDoc(slide_id, {
        success: function(slide) {
          callback(slide);
        }
      });
    },
    slide_by_number: function(presentation_id, number, callback) {
      couchapp.design.view('slides', {
        reduce: false,
        include_docs: true,
        limit: 1,
        skip: number - 1,
        startkey: [presentation_id, null],
        endkey: [presentation_id, {}],
        success: function(json) {
          var slide = json['rows'][0]['doc'];
          callback(slide);
        }
      });
    },
    save_slide_view: function(slide) {
      couchapp.db.saveDoc({
          type: 'SlideView',
          created_at: new Date().toJSON(),
          slide_id: slide._id
        }, {
          success: function(json) {
        }
      });
    },
    save_slide: function(slide, callback) {
      couchapp.db.saveDoc(slide, {success: callback});
    },
    slide_views: function(slide_view_number, count, callback) {
      couchapp.design.view('slide_views', {
        include_docs: true,
        limit: count || 1,
        skip: slide_view_number - 1,
        success: function(json) {
          var slide_views = [];
          for(var i in json['rows']) {
            slide_views.push(json['rows'][i]['doc']);
          };
          callback.apply(null, slide_views);
        }
      });
    },
    slide_count: function(presentation_id, callback) {
      couchapp.design.view('slides', {
        startkey: [presentation_id, null],
        endkey: [presentation_id, {}],
        success: function(json) {
          var count = null;
          if(json['rows'][0]) {
            count = json['rows'][0]['value'];
          } else {
            count = 0;
          };
          callback(count);
        }
      });
    }
  };
};