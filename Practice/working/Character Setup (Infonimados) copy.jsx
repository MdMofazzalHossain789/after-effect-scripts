// CharacterSetup.jsx - Lists all layers in the active comp with interactive property controls
// MIT License (c) 2025 Example Author

(function () {
  // Create a dialog window
  var win = new Window("palette", "Character Setup (Infonimados)", undefined, {
    resizeable: true,
  });
  // win.minimumSize.width = 200;
  // win.minimumSize.height = 50;
  win.orientation = "column";
  win.alignChildren = "fill";

  // Container for dynamic layer controls
  var layerContainer = win.add("group");
  layerContainer.orientation = "column";
  layerContainer.alignChildren = "left";

  function getStrokeTrimProperties(layer) {
    var properties = [];
    var contents = layer.property("ADBE Root Vectors Group");

    if (!contents) return properties;

    for (var i = 1; i <= contents.numProperties; i++) {
      var strokeWidth;
      var trimStart;
      var trimEnd;

      var object = {};

      object.hasTrim = false;

      var shapeGroup = contents.property(i);

      // alert(layer.name.indexOf("Hand"));

      // if (layer.name.indexOf("Hand") === 0) {
      //   alert("Hand - " + shapeGroup.name);
      // }

      var splittedName = layer.name.split(" ");
      var limbName = splittedName[0];
      var limbSide = splittedName[splittedName.length - 1];

      object.limbName = limbName;
      object.limbSide = limbSide;
      object.layerName = layer.name;
      object.groupName = shapeGroup.name;

      var stroke = shapeGroup
        .property("ADBE Vectors Group")
        .property("ADBE Vector Graphic - Stroke");
      if (stroke) {
        strokeWidth = stroke.property("ADBE Vector Stroke Width");

        object.strokeWidth = strokeWidth;
      }

      var trim = shapeGroup
        .property("ADBE Vectors Group")
        .property("ADBE Vector Filter - Trim");

      if (trim) {
        trimStart = trim.property("ADBE Vector Trim Start");
        trimEnd = trim.property("ADBE Vector Trim End");

        object.trimStart = trimStart;
        object.trimEnd = trimEnd;
        object.hasTrim = true;
      }

      properties.push(object);
    }

    return properties;
  }

  function getProperties() {
    var properties = [];

    // Remove all existing child elements manually
    while (layerContainer.children.length > 0) {
      layerContainer.children[0].remove();
    }

    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
      alert("Please select a composition.");
      return;
    }

    // var properties = []

    for (var i = 1; i <= comp.numLayers; i++) {
      var layer = comp.layer(i);

      if (layer.matchName === "ADBE Vector Layer") {
        var layerGroup = layerContainer.add("group");
        layerGroup.orientation = "row";
        layerGroup.alignChildren = "left";

        // Skip if name starts with "Color"
        if (layer.name.indexOf("Color") === 0) {
          continue; // ignore and go to next layer
        }

        properties.push(getStrokeTrimProperties(layer));

        // alert(properties.length);

        // showUI()
      }
    }

    return properties;
  }

  // Function to populate the list with layers and checkboxes
  function updateLayerList() {
    var props = getProperties();

    var hands = [];
    var legs = [];

    for (var i = 0; i < props.length; i++) {
      var innerArray = props[i];

      if (innerArray[i].limbName === "Hand") {
        // alert(innerArray[i]);
        hands.push(innerArray[i]);
      } else if (innerArray[i].limbName === "Feet") {
        legs.push(innerArray[i]);
      }
    }

    layerContainer.add("statictext", undefined, "Hands L/R");
    var divider = layerContainer.add("panel");
    divider.alignment = "fill";
    divider.preferredSize = [0, 2];

    var rowGroup = layerContainer.add("group");
    rowGroup.orientation = "row";
    rowGroup.alignChildren = "left";

    alert(hands[0].groupName);
  }

  // Add a refresh button
  var refreshBtn = win.add("button", undefined, "Refresh");
  refreshBtn.onClick = function () {
    updateLayerList();
    win.layout.layout(true);
  };

  updateLayerList();
  if (win instanceof Window) {
    win.center();
    win.show();
  } else {
    win.layout.layout(true);
  }
})();
