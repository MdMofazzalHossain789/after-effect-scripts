// Check if there is an active composition
var comp = app.project.activeItem;
if (comp == null || !(comp instanceof CompItem)) {
  alert("Please select a composition.");
} else {
  // Get the selected layers
  var selectedLayers = comp.selectedLayers;
  if (selectedLayers.length == 0) {
    alert("Please select a vector layer (e.g., Illustrator file).");
  } else {
    // Start an undo group for the operation
    app.beginUndoGroup("Create Shape from Vector Layer");

    selectedLayers[0].remove();
    // End the undo group
    app.endUndoGroup();
  }
}
