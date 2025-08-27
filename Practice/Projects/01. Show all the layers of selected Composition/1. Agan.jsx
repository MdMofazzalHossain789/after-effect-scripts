(function (thisObj) {
  function buildUI(thisObj) {
    var win =
      thisObj instanceof Panel
        ? thisObj
        : new Window("palette", "Stroke Size Controller", undefined, {
            resizeable: true,
          });

    var mainGroup = win.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["fill", "top"];

    var refreshBtn = mainGroup.add("button", undefined, "Refresh Shape Layers");

    // Container for layer rows
    var layersGroup = mainGroup.add("group");
    layersGroup.orientation = "column";
    layersGroup.alignChildren = ["fill", "top"];

    var strokeItems = []; // {layer, strokeWidth, groupName, uiGroup}

    // Get all stroke properties of a shape layer safely
    function getStrokeProperties(layer) {
      var strokes = [];
      var contents = layer.property("ADBE Root Vectors Group");
      if (!contents) return strokes;

      for (var i = 1; i <= contents.numProperties; i++) {
        var shapeGroup = contents.property(i);
        if (!shapeGroup) continue;

        var strokeGroup = shapeGroup.property("ADBE Vectors Group");
        if (!strokeGroup) continue;

        var stroke = strokeGroup.property("ADBE Vector Graphic - Stroke");
        if (!stroke) continue;

        var strokeWidth = stroke.property("ADBE Vector Stroke Width");
        if (strokeWidth) {
          strokes.push({
            layer: layer,
            strokeWidth: strokeWidth,
            groupName: shapeGroup.name,
          });
        }
      }
      return strokes;
    }

    // Build UI rows for all strokes
    function updateLayersUI() {
      layersGroup.removeAll();
      strokeItems = [];

      var comp = app.project.activeItem;
      if (!(comp && comp instanceof CompItem)) {
        layersGroup.add(
          "statictext",
          undefined,
          "⚠️ Please select a composition"
        );
        return;
      }

      for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        if (!layer || layer.matchName !== "ADBE Vector Layer") continue;

        var strokes = getStrokeProperties(layer);
        for (var j = 0; j < strokes.length; j++) {
          var row = layersGroup.add("group");
          row.orientation = "row";
          row.alignChildren = ["top", "center"];

          // Layer label color (random for demo)
          var label = row.add("panel", [0, 0, 20, 20], "");
          var col = [Math.random(), Math.random(), Math.random()];
          label.graphics.backgroundColor = label.graphics.newBrush(
            label.graphics.BrushType.SOLID_COLOR,
            col
          );

          // Layer + shape group name
          var nameText = row.add(
            "statictext",
            undefined,
            layer.name + " → " + strokes[j].groupName
          );
          nameText.characters = 25;

          // Property slider + numeric input
          var val = strokes[j].strokeWidth.value || 0;
          var slider = row.add("slider", [0, 0, 150, 20], val, 1, 100);
          var input = row.add("edittext", [0, 0, 50, 20], val.toFixed(1));

          // Sync slider → input → property
          slider.onChanging = (function (prop, inp) {
            return function () {
              var v = slider.value;
              inp.text = v.toFixed(1);
              app.beginUndoGroup("Change Stroke Width");
              prop.setValue(v);
              app.endUndoGroup();
            };
          })(strokes[j].strokeWidth, input);

          input.onChange = (function (prop, sldr, inp) {
            return function () {
              var v = parseFloat(inp.text);
              if (!isNaN(v)) {
                sldr.value = v;
                app.beginUndoGroup("Change Stroke Width");
                prop.setValue(v);
                app.endUndoGroup();
              }
            };
          })(strokes[j].strokeWidth, slider, input);

          strokeItems.push({
            layer: layer,
            strokeWidth: strokes[j].strokeWidth,
            groupName: strokes[j].groupName,
            uiGroup: row,
          });
        }
      }

      win.layout.layout(true);
    }

    refreshBtn.onClick = updateLayersUI;

    // Initial load
    updateLayersUI();

    if (win instanceof Window) {
      win.center();
      win.show();
    } else {
      win.layout.layout(true);
    }

    return win;
  }

  buildUI(thisObj);
})(this);
