function(doc) {
  if(doc.type == 'Slide') {
    emit([doc.presentation_id, doc.created_at], 1);
  }
}