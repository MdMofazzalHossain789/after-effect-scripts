// SimpleLayerLister.jsx - Lists all layers in the active comp
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

  // Add a listbox to display layers
  var layerList = win.add("listbox", undefined, [], {
    numberOfColumns: 5,
    showHeaders: true,
    columnTitles: [
      "#",
      "Name/Property",
      "Stroke Width",
      "Trim Start",
      "Trim End",
    ],
    columnWidths: [30, 200, 80, 80, 80],
    multiselect: true,
  });
  layerList.preferredSize = [500, 200];

  // Function to populate the list
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

  // Add a refresh button
  var refreshBtn = win.add("button", undefined, "Refresh");
  refreshBtn.onClick = updateLayerList;

  // Initial update and show the window
  updateLayerList();
  win.center();
  win.show();
})();
