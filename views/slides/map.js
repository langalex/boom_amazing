function(doc) {
  if(doc.type == 'Slide') {
    emit(doc.created_at, 1);
  }
}