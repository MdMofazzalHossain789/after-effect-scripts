{
  function showLayerPanel(thisObj) {
    var win =
      thisObj instanceof Panel
        ? thisObj
        : new Window("palette", "Layer Panel", undefined, { resizeable: true });

    // UI elements
    var layerList = win.add("listbox", [0, 0, 300, 400], [], {
      multiselect: false,
    });
    var refreshBtn = win.add("button", undefined, "Refresh Layers");

    // Function to update layer list
    function updateLayers() {
      layerList.removeAll();

      var comp = app.project.activeItem;
      if (comp && comp instanceof CompItem) {
        for (var i = 1; i <= comp.numLayers; i++) {
          var layer = comp.layer(i);
          layerList.add("item", i + ". " + layer.name);
        }
      } else {
        layerList.add("item", "⚠️ Please select a composition");
      }
    }

    // Refresh button action
    refreshBtn.onClick = function () {
      updateLayers();
    };

    // Run once when opened
    updateLayers();

    if (win instanceof Window) {
      win.center();
      win.show();
    } else {
      win.layout.layout(true);
    }
  }

  showLayerPanel(this);
}
