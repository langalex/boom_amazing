function(doc) {
  if(doc.type == 'SlideView') {
    emit(doc.created_at, null);
  }
}