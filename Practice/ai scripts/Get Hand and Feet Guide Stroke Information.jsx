// Check if there is an active document and a selection

function getLayerByPartialName(name) {
  var doc = app.activeDocument;
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (
      layer.name.toLowerCase().indexOf(name.toLowerCase()) === 0 &&
      layer.visible
    ) {
      return layer;
    }
  }
}

function getStrokes(layer) {
  var strokes = [];

  for (var j = 0; j < layer.pageItems.length; j++) {
    var item = layer.pageItems[i];
    if (item.typename === "GroupItem") {
      alert("Found a group: " + item.name);
    }
  }

  if (strokes.length > 0) {
    alert("Stroke sizes in layer '" + layer.name + "':\n" + strokes.join(", "));
  } else {
    alert("No stroked paths found in layer '" + layer.name + "'.");
  }
}

function stringify(obj) {
  if (obj === null) return "null";
  if (typeof obj === "number" || typeof obj === "boolean")
    return obj.toString();
  if (typeof obj === "string") return '"' + obj.replace(/"/g, '\\"') + '"';
  if (obj.constructor === Array) {
    var res = [];
    for (var i = 0; i < obj.length; i++) res.push(stringify(obj[i]));
    return "[" + res.join(",") + "]";
  }
  if (obj.constructor === Object) {
    var res = [];
    for (var key in obj) {
      res.push('"' + key + '":' + stringify(obj[key]));
    }
    return "{" + res.join(",") + "}";
  }
  return '""';
}

function saveImage(layerToExport, ext, object) {
  var doc = app.activeDocument;
  // Loop through selected items
  var item = layerToExport;

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

  // Reset ruler origin to the artboard’s top-left corner
  newDoc.rulerOrigin = [0, 0];

  // Ensure the active layer is unlocked and visible
  var activeLayer = newDoc.activeLayer;
  activeLayer.locked = false;
  activeLayer.visible = true;

  // Duplicate the item to the temporary document
  var dup = item.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

  // Clear any existing selection
  newDoc.selection = null;

  // Select all items in the active layer
  for (var j = 0; j < activeLayer.pageItems.length; j++) {
    activeLayer.pageItems[j].selected = true;
  }

  // Force Illustrator to update the document context
  app.redraw();

  // Fallback: Manually center the item
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

  var path;
    if ($.os.toLowerCase().indexOf("mac") === 0) {
        // Mac OS
        path = "/Users/Shared/";
    } else {
        // Windows
        path = "C:/Windows/Temp/";
    }
  
  object.image = path + "Selection_" + ext + ".png";
  var file = new File(object.image);
  var exportOptions = new ExportOptionsPNG24();
  exportOptions.artBoardClipping = true;
  exportOptions.transparency = true;
  tempDoc.exportFile(file, ExportType.PNG24, exportOptions);

  // Close the temporary document without saving
  tempDoc.close(SaveOptions.DONOTSAVECHANGES);
}

function getStroke(layer, data) {
  for (var i = 0; i < layer.pageItems.length; i++) {
    var item = layer.pageItems[i];

    if (item.typename === "GroupItem") {
      var strokeSizes = [];
      var object = {};
      for (var j = 0; j < item.pathItems.length; j++) {
        var pathItem = item.pathItems[j];
        if (pathItem.stroked && !pathItem.filled) {
          strokeSizes.push(pathItem.strokeWidth);
          //alert("Stroke Found - " + pathItem.strokeWidth);

          if (j === 0) {
            saveImage(item, i + 1, object);
          }
        }
      }
      object.strokeSizes = strokeSizes;
      data.push(object);
    } else {
      var strokeSizes = [];
      var object = {};
      if (item.stroked && !item.filled) {
        strokeSizes.push(item.strokeWidth);
        //alert("Stroke Found - " + pathItem.strokeWidth);

        saveImage(item, i + 1, object);
      }
      object.strokeSizes = strokeSizes;
      data.push(object);
    }
  }
}

var data = [];
var guideLayer = getLayerByPartialName("Hand and Feet Guide");

// alert(guideLayer.pageItems.length);

getStroke(guideLayer, data);

data;
