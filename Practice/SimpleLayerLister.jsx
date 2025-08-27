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

  // Add a refresh button
  var refreshBtn = win.add("button", undefined, "Refresh");
  refreshBtn.onClick = updateLayerList;

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
      var layerGroup = layerContainer.add("group");
      layerGroup.orientation = "row";
      layerGroup.alignChildren = "left";

      // Add index and name
      var indexText = layerGroup.add(
        "statictext",
        undefined,
        i + ": " + layer.name
      );
      indexText.preferredSize = [200, 20]; // Adjusted width for longer names

      // Add checkbox for visibility (enabled)
      var visibleCheck = layerGroup.add("checkbox", undefined, "Visible");
      visibleCheck.value = layer.enabled;
      visibleCheck.onClick = (function (l, chk) {
        return function () {
          app.beginUndoGroup("Toggle Visibility");
          l.enabled = chk.value;
          app.endUndoGroup();
        };
      })(layer, visibleCheck);

      // Add checkbox for locked
      var lockedCheck = layerGroup.add("checkbox", undefined, "Locked");
      lockedCheck.value = layer.locked;
      lockedCheck.onClick = (function (l, chk) {
        return function () {
          app.beginUndoGroup("Toggle Locked");
          l.locked = chk.value;
          app.endUndoGroup();
        };
      })(layer, lockedCheck);

      // Add checkbox for solo
      var soloCheck = layerGroup.add("checkbox", undefined, "Solo");
      soloCheck.value = layer.solo;
      soloCheck.onClick = (function (l, chk) {
        return function () {
          app.beginUndoGroup("Toggle Solo");
          l.solo = chk.value;
          app.endUndoGroup();
        };
      })(layer, soloCheck);
    }
  }

  // Initial update and show the window
  updateLayerList();
  win.center();
  win.show();
})();
