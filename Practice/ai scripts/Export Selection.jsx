// Check if there is an active document and a selection
if (app.documents.length > 0 && app.activeDocument.selection.length > 0) {
  var doc = app.activeDocument;

  // Loop through selected items
  for (var i = 0; i < doc.selection.length; i++) {
    var item = doc.selection[i];

    // Log item type for debugging
    //alert("Processing item " + (i + 1) + ", type: " + item.typename);

    // Get the visible bounds of the item [left, top, right, bottom]
    var bounds = item.visibleBounds;
    var width = bounds[2] - bounds[0]; // right - left
    var height = bounds[1] - bounds[3]; // top - bottom
    if (width <= 0) width = 1; // Prevent zero or negative width
    if (height <= 0) height = 1; // Prevent zero or negative height

    // Create a temporary document with the same color space and size
    var tempDoc = app.documents.add(doc.documentColorSpace, width, height);

    // Explicitly set tempDoc as the active document
    app.activeDocument = tempDoc;
    var newDoc = app.activeDocument;

    // Verify tempDoc is active
    if (app.activeDocument !== tempDoc) {
      //alert("Failed to set tempDoc as active document for item " + (i + 1));
      tempDoc.close(SaveOptions.DONOTSAVECHANGES);
      continue; // Skip to next item
    }

    // Reset ruler origin to the artboard’s top-left corner
    newDoc.rulerOrigin = [0, 0];

    // Ensure the active layer is unlocked and visible
    var activeLayer = newDoc.activeLayer;
    activeLayer.locked = false;
    activeLayer.visible = true;

    // Duplicate the item to the temporary document
    var dup = item.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

    // Log duplicated item type for debugging
    //alert("Duplicated item type: " + dup.typename);

    // Clear any existing selection
    newDoc.selection = null;

    // Select all items in the active layer
    for (var j = 0; j < activeLayer.pageItems.length; j++) {
      activeLayer.pageItems[j].selected = true;
    }

    // Force Illustrator to update the document context
    app.redraw();

    // Verify selection
    //alert("Active Document - " + newDoc.name + ", selection length: " + newDoc.selection.length + ", layer: " + activeLayer.name);
    if (newDoc.selection.length > 0) {
      // Set alignment to artboard
      app.executeMenuCommand("align to artboard");

      // Execute alignment commands to center the item
      app.executeMenuCommand("Horizontal Align Center");
      app.executeMenuCommand("Vertical Align Center");
    } else {
      // Fallback: Manually center the item
      //alert("Failed to select duplicated item in temporary document for item " + (i + 1) + "; using manual centering");
      var dupBounds = dup.visibleBounds; // [left, top, right, bottom]
      var dupWidth = dupBounds[2] - dupBounds[0];
      var dupHeight = dupBounds[1] - dupBounds[3];

      // Calculate the center of the artboard
      var artboardCenterX = width / 2;
      var artboardCenterY = height / 2;

      // Calculate the center of the duplicated item
      var itemCenterX = dupBounds[0] + dupWidth / 2;
      var itemCenterY = dupBounds[3] + dupHeight / 2;

      // Move the item to center it
      var deltaX = artboardCenterX - itemCenterX;
      var deltaY = artboardCenterY - itemCenterY;
      dup.translate(deltaX, deltaY);
    }

    // Export the temporary document as PNG
    var file = new File("C:/Windows/Temp/Selection_" + (i + 1) + ".png");
    var exportOptions = new ExportOptionsPNG24();
    exportOptions.artBoardClipping = true;
    exportOptions.transparency = true;
    tempDoc.exportFile(file, ExportType.PNG24, exportOptions);

    // Close the temporary document without saving
    tempDoc.close(SaveOptions.DONOTSAVECHANGES);
  }

  // Restore the original document as active
  app.activeDocument = doc;
} else {
  alert("Please select at least one object in an active document.");
}
