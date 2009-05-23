function(doc) {
  if(doc.type == 'Slide') {
    emit(doc.created_at, null);
  }
}