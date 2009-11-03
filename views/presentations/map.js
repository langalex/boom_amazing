function(doc) {
  if(doc._attachments) {
    for(var i in doc._attachments) {
     var attachment = doc._attachments[i];
     if(attachment.content_type == 'image/svg+xml') {
       emit(doc._id, i);
     }
    };
  }
}