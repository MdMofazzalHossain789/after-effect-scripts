var comp = app.project.activeItem;

if (!comp || !(comp instanceof CompItem)) {
  alert("Select a composition first");
}

var ignoreLayers = [
  //   "Color",
  //   "Character",
  "Guide",
  "Path Position",
  "Full Guide",
  "Hand and Feet",
];

// Helper to find layer by part and side
function findLayer(name) {
  for (var i = 1; i <= comp.numLayers; i++) {
    var l = comp.layer(i);
    if (l.name.indexOf(name) === 0) return l;
  }
  return null;
}

function isThis(layerName, name) {
  if (layerName.indexOf(name) === 0) {
    return true;
  } else {
    return false;
  }
}

function setParents() {
  app.beginUndoGroup("Set Parents");
  for (var i = 1; i <= comp.numLayers; i++) {
    var layer = comp.layer(i);
    var layerName = layer.name;

    // Check if this layer should be ignored
    var ignore = false;
    for (var j = 0; j < ignoreLayers.length; j++) {
      if (layer.locked) layer.locked = false;
      if (layer.canSetCollapseTransformation) {
        // AI layer
        layer.collapseTransformation = true;
      }
      if (layerName.indexOf(ignoreLayers[j]) === 0) {
        if (!layer.locked) layer.locked = true;
        ignore = true;
        break; // no need to check other ignore names
      }
    }

    if (ignore) continue; // skip this layer

    // Your code for layers you want to process
    if (isThis(layerName, "Brow")) {
      layer.parent = findLayer("Head");
    } else if (isThis(layerName, "Pupil")) {
      layer.parent = findLayer("Eyes");
    } else if (isThis(layerName, "Eyes")) {
      layer.parent = findLayer("Head");
    } else if (isThis(layerName, "Mouth")) {
      layer.parent = findLayer("Head");
    } else if (isThis(layerName, "Head")) {
      layer.parent = findLayer("Body");
    } else if (isThis(layerName, "Feet")) {
      layer.parent = findLayer("Character");
    } else if (isThis(layerName, "Hand")) {
      layer.parent = findLayer("Body");
    } else if (isThis(layerName, "Body")) {
      layer.parent = findLayer("Character");
    } else if (isThis(layerName, "Color")) {
      layer.parent = findLayer("Character");
    }
  }
  app.endUndoGroup();
}

setParents();
