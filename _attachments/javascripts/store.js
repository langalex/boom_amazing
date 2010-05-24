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
    save_slide: function(slide, callback) {
      couchapp.db.saveDoc(slide, {success: callback});
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