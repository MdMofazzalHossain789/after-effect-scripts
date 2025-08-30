(function () {
  var win = new Window("palette", "AI Stroke Reader", undefined);
  win.orientation = "column";
  win.alignChildren = ["fill", "top"];

  var btn = win.add("button", undefined, "Get Hand Stroke Width");
  var resultText = win.add("statictext", undefined, "Stroke Width: --", {
    multiline: true,
  });

  function findLayersByPartialName(comp, name) {
    for (var i = 1; i <= comp.numLayers; i++) {
      var l = comp.layer(i);
      if (l.name.toLowerCase().indexOf(name.toLowerCase()) === 0) {
        return l;
      }
    }

    return null;
  }

  // Simple JSON parser for ExtendScript
  function parseJSON(str) {
    // Remove leading/trailing spaces
    str = str.replace(/^\s+|\s+$/g, "");

    // Strings must use double quotes in valid JSON
    // So we can safely use eval with parentheses
    return new Function("return " + str)();
  }

  var newPanel = win.add("group");
  newPanel.orientation = "column";
  newPanel.alignChildren = "fill";

  btn.onClick = function () {
    while (newPanel.children.length > 0) {
      newPanel.remove(newPanel.children[0]);
    }
    win.alignChildren = ["fill", "top"];
    win.layout.layout(true);

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
      alert("Please select a composition.");
      return;
    }

    var handLayer = findLayersByPartialName(comp, "Hand and Feet guide");
    if (!handLayer) {
      alert("Layer 'Hand' not found in the comp!");
      return;
    }

    var footage = handLayer.source;
    if (!(footage instanceof FootageItem)) {
      alert("The Hand layer is not linked to Illustrator footage.");
      return;
    }

    var aiFile = footage.file;
    if (!aiFile || !aiFile.exists) {
      alert("Cannot find Illustrator file path.");
      return;
    }

    var targetLayer = "Hand";

    resultText.text = "Getting stroke widths from Illustrator...";
    // Illustrator-side script using string concatenation
    var illusScript =
      'var f = new File("' +
      aiFile.fsName.replace(/\\/g, "\\\\") +
      '");' +
      "app.open(f);" +
      "function getLayerByPartialName(name) {" +
      "  var doc = app.activeDocument;" +
      "  for (var i = 0; i < doc.layers.length; i++) {" +
      "    var layer = doc.layers[i];" +
      "    if (layer.name.toLowerCase().indexOf(name.toLowerCase()) === 0 && layer.visible) {" +
      "      return layer;" +
      "    }" +
      "  }" +
      "}" +
      "function getStrokes(layer) {" +
      "  var strokes = [];" +
      "  for (var j = 0; j < layer.pageItems.length; j++) {" +
      "    var item = layer.pageItems[j];" + // Fixed typo: was pageItems[i]
      '    if (item.typename === "GroupItem") {' +
      '      alert("Found a group: " + item.name);' +
      "    }" +
      "  }" +
      "  if (strokes.length > 0) {" +
      '    alert("Stroke sizes in layer \'" + layer.name + "\':\\n" + strokes.join(", "));' +
      "  } else {" +
      '    alert("No stroked paths found in layer \'" + layer.name + "\'.");' +
      "  }" +
      "}" +
      "function saveImage(layerToExport, ext, object) {" +
      "  var doc = app.activeDocument;" +
      "  var item = layerToExport;" +
      "  var bounds = item.visibleBounds;" +
      "  var width = bounds[2] - bounds[0];" +
      "  var height = bounds[1] - bounds[3];" +
      "  if (width <= 0) width = 1;" +
      "  if (height <= 0) height = 1;" +
      "  var tempDoc = app.documents.add(doc.documentColorSpace, width, height);" +
      "  app.activeDocument = tempDoc;" +
      "  var newDoc = app.activeDocument;" +
      "  newDoc.rulerOrigin = [0, 0];" +
      "  var activeLayer = newDoc.activeLayer;" +
      "  activeLayer.locked = false;" +
      "  activeLayer.visible = true;" +
      "  var dup = item.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);" +
      "  newDoc.selection = null;" +
      "  for (var j = 0; j < activeLayer.pageItems.length; j++) {" +
      "    activeLayer.pageItems[j].selected = true;" +
      "  }" +
      "  app.redraw();" +
      "  var dupBounds = dup.visibleBounds;" +
      "  var dupWidth = dupBounds[2] - dupBounds[0];" +
      "  var dupHeight = dupBounds[1] - dupBounds[3];" +
      "  var artboardCenterX = width / 2;" +
      "  var artboardCenterY = height / 2;" +
      "  var itemCenterX = dupBounds[0] + dupWidth / 2;" +
      "  var itemCenterY = dupBounds[3] + dupHeight / 2;" +
      "  var deltaX = artboardCenterX - itemCenterX;" +
      "  var deltaY = artboardCenterY - itemCenterY;" +
      "  dup.translate(deltaX, deltaY);" +
      '  object.image = "C:/Windows/Temp/Selection_" + ext + ".png";' +
      "  var file = new File(object.image);" +
      "  var exportOptions = new ExportOptionsPNG24();" +
      "  exportOptions.artBoardClipping = true;" +
      "  exportOptions.transparency = true;" +
      "  tempDoc.exportFile(file, ExportType.PNG24, exportOptions);" +
      "  tempDoc.close(SaveOptions.DONOTSAVECHANGES);" +
      "}" +
      "function getStroke(layer, data) {" +
      "  for (var i = 0; i < layer.pageItems.length; i++) {" +
      "    var item = layer.pageItems[i];" +
      '    if (item.typename === "GroupItem") {' +
      "      var strokeSizes = [];" +
      "      var object = {};" +
      "var runOnce = true;" +
      "      for (var j = 0; j < item.pathItems.length; j++) {" +
      "        var pathItem = item.pathItems[j];" +
      "        if (pathItem.stroked && !pathItem.filled) {" +
      "          strokeSizes.push(pathItem.strokeWidth);" +
      "          if (runOnce) {" +
      "            saveImage(item, i + 1, object);" +
      "runOnce = false;" +
      "          }" +
      "        }" +
      "      }" +
      "if(strokeSizes.length>0) {" +
      "object.strokeSizes = strokeSizes;" +
      "      data.push(object);}" +
      "    }" +
      "  }" +
      "}" +
      "function stringify(obj) {\
  if (obj === null) return 'null';\
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj.toString();\
  if (typeof obj === 'string') return '\"' + obj.replace(/\"/g, '\\\"') + '\"';\
  if (obj.constructor === Array) {\
    var res = [];\
    for (var i=0; i<obj.length; i++) res.push(stringify(obj[i]));\
    return '[' + res.join(',') + ']';\
  }\
  if (obj.constructor === Object) {\
    var res = [];\
    for (var key in obj) {\
      res.push('\"' + key + '\":' + stringify(obj[key]));\
    }\
    return '{' + res.join(',') + '}';\
  }\
  return '\"\"';\
}" +
      "var data = [];" +
      'var guideLayer = getLayerByPartialName("Hand and Feet Guide");' +
      "getStroke(guideLayer, data);" +
      "stringify(data);";

    // Send to Illustrator
    var bt = new BridgeTalk();
    bt.target = "illustrator";
    bt.body = illusScript;

    bt.onResult = function (res) {
      var val = res.body;
      if (val == "-1") {
        // alert("No stroke found in Hand layer!");
        resultText.text = "❌ Not found any stroke";
        // resultText.text = "No stroke found in Hand layer!";
      } else {
        resultText.text = "✅ Strokes Found!";
        // alert("Hand Stroke Width: " + val);

        var data = parseJSON(val);

        for (var i = 0; i < data.length; i++) {
          var rowLayout = newPanel.add("group");
          rowLayout.orientation = "row";
          rowLayout.alignChildren = "left";

          var colLayout = rowLayout.add("group");
          colLayout.orientation = "column";

          var image = data[i].image;
          var strokeSizes = data[i].strokeSizes;
          rowLayout.add("image", undefined, image);
          for (var j = 0; j < strokeSizes.length; j++) {
            var strokeSize = strokeSizes[j];
            colLayout.add("statictext", undefined, strokeSize.toFixed(2));
          }
        }

        win.layout.layout(true);

        // resultText.text = "Hand Stroke Width: " + val;
      }
    };

    bt.onError = function (err) {
      alert("Illustrator error: " + err.body);
    };

    bt.send();
  };

  win.center();
  win.show();
})();
