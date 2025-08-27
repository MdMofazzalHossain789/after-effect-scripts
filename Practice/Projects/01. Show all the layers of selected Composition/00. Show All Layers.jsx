(function (thisObj) {
  function buildUI(thisObj) {
    var win =
      thisObj instanceof Panel
        ? thisObj
        : new Window("palette", "Stroke Size Controller", undefined, {
            resizeable: true,
          });

    var group = win.add("group");
    group.orientation = "column";
    group.alignChildren = ["fill", "top"];

    var refreshBtn = group.add("button", undefined, "Refresh Shape Layers");
    var strokeList = group.add("listbox", [0, 0, 350, 200], [], {
      multiselect: false,
    });

    var numberGroup = group.add("group");
    numberGroup.orientation = "row";
    numberGroup.alignChildren = ["fill", "center"];

    var strokeSizeInput = numberGroup.add("edittext", [0, 0, 60, 25], "1");
    var strokeSlider = numberGroup.add("slider", [0, 0, 200, 25], 1, 1, 100);

    var strokeItems = []; // {layer, strokeProp, groupName}

    function getStrokeProperties(layer) {
      var strokes = [];
      var contents = layer.property("ADBE Root Vectors Group");
      if (!contents) return strokes;

      for (var i = 1; i <= contents.numProperties; i++) {
        var shapeGroup = contents.property(i);
        var stroke = shapeGroup
          .property("ADBE Vectors Group")
          .property("ADBE Vector Graphic - Stroke");
        if (stroke) {
          var strokeWidth = stroke.property("ADBE Vector Stroke Width");
          if (strokeWidth)
            strokes.push({
              layer: layer,
              strokeWidth: strokeWidth,
              groupName: shapeGroup.name,
            });
        }
      }
      return strokes;
    }

    function updateList() {
      strokeList.removeAll();
      strokeItems = [];

      var comp = app.project.activeItem;
      if (!(comp && comp instanceof CompItem)) {
        strokeList.add("item", "⚠️ Please select a composition");
        return;
      }

      for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        if (layer.matchName === "ADBE Vector Layer") {
          var strokes = getStrokeProperties(layer);
          for (var j = 0; j < strokes.length; j++) {
            var item = strokeList.add(
              "item",
              layer.name +
                " → " +
                strokes[j].groupName +
                " (Stroke: " +
                strokes[j].strokeWidth.value +
                ")"
            );
            strokeItems.push(strokes[j]);
          }
        }
      }
    }

    refreshBtn.onClick = updateList;

    function updateUIValue(idx) {
      if (idx < 0 || idx >= strokeItems.length) return;
      var val = strokeItems[idx].strokeWidth.value;
      strokeSizeInput.text = val.toFixed(1);
      strokeSlider.value = val;
    }

    // Selecting a layer
    strokeList.onChange = function () {
      var idx = strokeList.selection.index;
      updateUIValue(idx);
    };

    // Live update: Slider changes property instantly
    strokeSlider.onChanging = function () {
      var idx = strokeList.selection ? strokeList.selection.index : -1;
      if (idx >= 0) {
        var val = strokeSlider.value;
        strokeSizeInput.text = val.toFixed(1);
        app.beginUndoGroup("Change Stroke Size");
        strokeItems[idx].strokeWidth.setValue(val);
        app.endUndoGroup();
      }
    };

    // Edittext typing updates property instantly
    strokeSizeInput.onChange = function () {
      var idx = strokeList.selection ? strokeList.selection.index : -1;
      if (idx >= 0) {
        var val = parseFloat(strokeSizeInput.text);
        if (!isNaN(val)) {
          strokeSlider.value = val;
          app.beginUndoGroup("Change Stroke Size");
          strokeItems[idx].strokeWidth.setValue(val);
          app.endUndoGroup();
        }
      }
    };

    // Initial load
    updateList();

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
