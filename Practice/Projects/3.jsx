// SimpleLayerLister.jsx - Lists all layers in the active comp
// MIT License (c) 2025 Example Author

(function () {
  // Create a dialog window
  var win = new Window("palette", "Layer Lister", undefined, {
    resizeable: true,
  });
  win.orientation = "column";
  win.alignChildren = "fill";

  // Add a listbox to display layers
  var layerList = win.add("listbox", undefined, [], { multiselect: true });
  layerList.preferredSize = [300, 200];

  // Function to populate the list
  function updateLayerList() {
    layerList.removeAll(); // Clear existing items
    var comp = app.project.activeItem;
    if (comp && comp instanceof CompItem) {
      for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        layerList.add("item", i + ": " + layer.name);
      }
    } else {
      layerList.add("item", "No composition selected");
    }
  }

  // Add a refresh button
  var refreshBtn = win.add("button", undefined, "Refresh");
  refreshBtn.onClick = updateLayerList;

  // Initial update and show the window
  updateLayerList();
  win.center();
  win.show();
})();
