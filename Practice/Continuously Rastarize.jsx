var comp = app.project.activeItem;

alert(comp.numLayers);

for (var i = 1; i <= comp.numLayers; i++) {
  var layer = comp.layer(i);

  if (layer.canSetCollapseTransformation) {
    // AI layer
    app.beginUndoGroup("Enable CR");
    layer.collapseTransformation = true;
    app.endUndoGroup();
  }
}
