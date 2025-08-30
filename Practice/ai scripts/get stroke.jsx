// Illustrator ExtendScript
function getLayerStrokeSize(layerName) {
  if (app.documents.length === 0) {
    alert("No document is open.");
    return;
  }

  var doc = app.activeDocument;
  var targetLayer = null;

  // Find the layer by name
  for (var i = 0; i < doc.layers.length; i++) {
    if (doc.layers[i].name === layerName) {
      targetLayer = doc.layers[i];
      break;
    }
  }

  if (targetLayer === null) {
    alert("Layer '" + layerName + "' not found.");
    return;
  }

  var strokes = [];
  // Loop through all path items in the layer
  for (var j = 0; j < targetLayer.pathItems.length; j++) {
    var path = targetLayer.pathItems[j];
    if (path.stroked) {
      strokes.push(path.strokeWidth);
    }
  }

  if (strokes.length > 0) {
    alert("Stroke sizes in layer '" + layerName + "':\n" + strokes.join(", "));
  } else {
    alert("No stroked paths found in layer '" + layerName + "'.");
  }
}

// Example: check "Hand" layer
getLayerStrokeSize("Hand");
