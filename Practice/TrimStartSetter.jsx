(function (thisObj) {
  function buildUI(thisObj) {
    var panel =
      thisObj instanceof Panel
        ? thisObj
        : new Window("palette", "Trim Start Setter", undefined, {
            resizeable: true,
          });
    panel.orientation = "column";
    panel.alignChildren = "fill";

    // Add an input field for the percentage
    var inputLabel = panel.add(
      "statictext",
      undefined,
      "Enter Trim Start % (0-100):"
    );
    var inputField = panel.add("edittext", undefined, "50");
    inputField.characters = 10; // Set width for 3-digit input

    // Add an apply button
    var applyButton = panel.add("button", undefined, "Apply");
    applyButton.onClick = function () {
      var comp = app.project.activeItem;
      if (!comp || !(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
      }

      var layer = comp.selectedLayers[0]; // Get the first selected layer
      if (!layer || !(layer instanceof ShapeLayer)) {
        alert("Please select a shape layer.");
        return;
      }

      var trimStartValue = parseFloat(inputField.text);
      if (isNaN(trimStartValue) || trimStartValue < 0 || trimStartValue > 100) {
        alert("Please enter a valid number between 0 and 100.");
        return;
      }

      // Find and set the Trim Start property
      var shapeGroup = layer.property("ADBE Root Vectors Group");
      if (shapeGroup) {
        for (var i = 1; i <= shapeGroup.numProperties; i++) {
          var group = shapeGroup.property(i);
          if (group.matchName === "ADBE Vector Group") {
            var contents =
              group.property("ADBE Vectors Group") ||
              group.property("ADBE Vector Group Content");
            if (contents) {
              var trim = contents.property("ADBE Vector Filter - Trim");
              if (trim) {
                var trimStart = trim.property("ADBE Vector Trim Start");
                app.beginUndoGroup("Set Trim Start");
                trimStart.setValue(trimStartValue);
                app.endUndoGroup();
                alert(
                  "Trim Start set to " + trimStartValue + "% on " + layer.name
                );
                return; // Exit after first trim path found
              }
            }
          }
        }
      }
      alert("No Trim Paths modifier found in the selected shape layer.");
    };

    panel.layout.layout(true);
    return panel;
  }

  var customPanel = buildUI(thisObj);
  if (customPanel instanceof Window) {
    customPanel.center();
    customPanel.show();
  }
})(this);
