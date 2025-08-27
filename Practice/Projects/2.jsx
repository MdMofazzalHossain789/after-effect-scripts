(function (thisObj) {
  function buildUI(thisObj) {
    var panel =
      thisObj instanceof Panel
        ? thisObj
        : new Window("palette", "Custom Layer Panel", undefined, {
            resizeable: true,
          });
    panel.orientation = "column";
    panel.alignChildren = "fill";

    // Add a refresh button
    var refreshButton = panel.add("button", undefined, "Refresh Layers");
    refreshButton.onClick = updateLayerList;

    // Add the listbox with multiple columns
    var layerList = panel.add("listbox", undefined, [], {
      numberOfColumns: 5,
      showHeaders: true,
      columnTitles: ["#", "Name", "Visible", "Locked", "Solo"],
      columnWidths: [30, 150, 60, 60, 60],
      multiselect: true,
    });

    // Function to update the list with layers from the selected comp
    function updateLayerList() {
      layerList.removeAll(); // Clear existing items
      var comp = app.project.activeItem;
      if (comp && comp instanceof CompItem) {
        for (var i = 1; i <= comp.numLayers; i++) {
          var layer = comp.layer(i);
          var item = layerList.add("item", i.toString()); // Column 1: Index
          item.subItems[0].text = layer.name; // Column 2: Name
          item.subItems[1].text = layer.enabled ? "Yes" : "No"; // Column 3: Visible
          item.subItems[2].text = layer.locked ? "Yes" : "No"; // Column 4: Locked
          item.subItems[3].text = layer.solo ? "Yes" : "No"; // Column 5: Solo
        }
      } else {
        alert("Please select a composition.");
      }
    }

    // Optional: Double-click to toggle visibility (example interaction)
    layerList.onDoubleClick = function () {
      var selected = layerList.selection;
      if (selected) {
        var comp = app.project.activeItem;
        if (comp && comp instanceof CompItem) {
          app.beginUndoGroup("Toggle Layer Visibility");
          for (var j = 0; j < selected.length; j++) {
            var layerIndex = parseInt(selected[j].text); // Get index from Column 1
            var layer = comp.layer(layerIndex);
            layer.enabled = !layer.enabled;
          }
          app.endUndoGroup();
          updateLayerList(); // Refresh after change
        }
      }
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
