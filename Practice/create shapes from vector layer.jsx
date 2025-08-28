var comp = app.project.activeItem;

if (!comp || !(comp instanceof CompItem)) {
  alert("Select a composition first");
} else {
  var aiLayer = comp.layer("Mouth");
  if (!aiLayer) {
    alert("Layer 'mouth' not found");
  } else {
    app.beginUndoGroup("Convert AI to Shapes");

    // Deselect all layers first
    for (var i = 1; i <= comp.numLayers; i++) {
      comp.layer(i).selected = false;
    }

    // Select your layer
    aiLayer.selected = true;

    // Convert to shapes
    // ⚠️ 2800 = Create Shapes from Vector Layer
    app.executeCommand(3064);
    // app.findMenuCommandId("Create Shapes from Vector Layer");

    app.endUndoGroup();

    alert("Conversion done! Check new shape layer above the AI layer.");
  }
}
