// CharacterSetup.jsx - Lists all layers in the active comp with interactive property controls
// MIT License (c) 2025 Example Author

(function () {
  // Create a dialog window
  var win = new Window("palette", "Character Setup (Infonimados)", undefined, {
    resizeable: true,
  });
  win.minimumSize.width = 500;
  win.minimumSize.height = 150;
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
      var shapeGroup = contents.property(i);
      var stroke = shapeGroup
        .property("ADBE Vectors Group")
        .property("ADBE Vector Graphic - Stroke");
      if (stroke) {
        strokeWidth = stroke.property("ADBE Vector Stroke Width");
      }

      var trim = shapeGroup
        .property("ADBE Vectors Group")
        .property("ADBE Vector Filter - Trim");

      if (trim) {
        trimStart = trim.property("ADBE Vector Trim Start");
        trimEnd = trim.property("ADBE Vector Trim End");
      }

      if (strokeWidth || (trimStart && trimEnd))
        properties.push({
          layer: layer,
          strokeWidth: strokeWidth,
          trimStart: trimStart,
          trimEnd: trimEnd,
          groupName: shapeGroup.name,
        });
    }
    return properties;
  }

  var ignoreShapeLayers = ["Color"];

  // Function to populate the list with layers and checkboxes
  function updateLayerList() {
    // Remove all existing child elements manually
    while (layerContainer.children.length > 0) {
      layerContainer.children[0].remove();
    }

    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
      alert("Please select a composition.");
      return;
    }

    for (var i = 1; i <= comp.numLayers; i++) {
      var layer = comp.layer(i);

      if (layer.matchName === "ADBE Vector Layer") {
        var layerGroup = layerContainer.add("group");
        layerGroup.orientation = "row";
        layerGroup.alignChildren = "left";

        var properties = getStrokeTrimProperties(layer);

        // Skip if name starts with "Color"
        if (layer.name.indexOf("Color") === 0) {
          continue; // ignore and go to next layer
        }

        // $.writeln("Properties - " + properties.length);
        layerGroup.add(
          "statictext",
          undefined,
          i + ": " + layer.name
        ).preferredSize = [100, 20];

        // Container for properties (indented)
        var shapeNameContainer = layerGroup.add("group");
        shapeNameContainer.orientation = "column";
        shapeNameContainer.alignChildren = "left";
        shapeNameContainer.margins = [20, 0, 0, 0]; // indent

        for (var j = 0; j < properties.length; j++) {
          var prop = properties[j];

          // group for each property row
          var propRow = shapeNameContainer.add("group");
          propRow.orientation = "row";
          propRow.alignChildren = ["left", "center"];

          // Add index and name
          var indexText = (propRow.add(
            "statictext",
            undefined,
            prop.groupName
          ).preferredSize = [100, 20]);
          //   indexText.preferredSize = [50, 20]; // Adjusted width for longer names

          // Add Input field for stroke width
          var strokeWidthInput = propRow.add(
            "edittext",
            undefined,
            prop.strokeWidth.value
          );
          strokeWidthInput.characters = 3; // width
          // ✅ Capture prop + input in a closure
          (function (prop, strokeWidthInput) {
            strokeWidthInput.onChanging = function () {
              this.text = this.text.replace(/[^\d.-]/g, "");
              var val = parseFloat(this.text);
              if (val <= 0) val = 1;
              if (!isNaN(val)) {
                app.beginUndoGroup("Change Stroke Size");
                prop.strokeWidth.setValue(val);
                app.endUndoGroup();

                // ✅ directly show the latest value in this field
                this.text = prop.strokeWidth.value.toString();
              }
            };
          })(prop, strokeWidthInput);

          var trimStartInput = propRow.add(
            "edittext",
            undefined,
            prop.trimStart.value
          );
          trimStartInput.characters = 4; // width

          (function (prop, input) {
            input.onChanging = function () {
              this.text = this.text.replace(/[^\d.-]/g, "");
              var val = parseFloat(this.text);
              if (val <= 0) val = 1;
              if (!isNaN(val)) {
                app.beginUndoGroup("Change Stroke Size");
                prop.trimStart.setValue(val);
                app.endUndoGroup();

                // ✅ directly show the latest value in this field
                this.text = prop.trimStart.value.toString();
              }
            };
          })(prop, trimStartInput);

          var trimEndInput = propRow.add(
            "edittext",
            undefined,
            prop.trimEnd.value
          );
          trimEndInput.characters = 4; // width

          (function (prop, input) {
            input.onChanging = function () {
              this.text = this.text.replace(/[^\d.-]/g, "");
              var val = parseFloat(this.text);
              if (val <= 0) val = 1;
              if (!isNaN(val)) {
                app.beginUndoGroup("Change Stroke Size");
                prop.trimEnd.setValue(val);
                app.endUndoGroup();

                // ✅ directly show the latest value in this field
                this.text = prop.trimEnd.value.toString();
              }
            };
          })(prop, trimEndInput);
        }
        // 🔹 Add divider under each layer
        var divider = layerContainer.add("panel");
        divider.alignment = "fill";
        divider.preferredSize = [0, 2];
      }
    }
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
