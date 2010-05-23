function(doc) {
  if(doc._attachments) {
    for(var i in doc._attachments) {
     var attachment = doc._attachments[i];
     if(attachment.content_type.match(/svg||png|gif|jpe?g/)) {
       emit(doc._id, i);
     }
    };
  }
}