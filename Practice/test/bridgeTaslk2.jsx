(function () {
  var win = new Window("palette", "AI Stroke Reader", undefined);
  win.orientation = "column";
  win.alignChildren = ["fill", "top"];

  var btn = win.add("button", undefined, "Get Hand Stroke Width");
  var resultText = win.add("statictext", undefined, "Stroke Width: --", {
    multiline: true,
  });

  btn.onClick = function () {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
      alert("Please select a composition.");
      return;
    }

    // Find the Illustrator footage source from one of the layers
    var handLayer = comp.layer("Hand");
    if (!handLayer) {
      alert("Layer 'Hand' not found in the comp!");
      return;
    }

    var footage = handLayer.source;
    if (!(footage instanceof FootageItem)) {
      alert("The Hand layer is not linked to Illustrator footage.");
      return;
    }

    var aiFile = footage.file;
    if (!aiFile || !aiFile.exists) {
      alert("Cannot find Illustrator file path.");
      return;
    }

    var targetLayer = "Hand"; // 👈 Layer name in Illustrator

    // Illustrator-side script
    var illusScript =
      "var f = new File('" +
      aiFile.fsName +
      "');" +
      "app.open(f);" +
      "var doc = app.activeDocument;" +
      "var lyr = doc.layers.getByName('" +
      targetLayer +
      "');" +
      "var strokeW = -1;" +
      "if (lyr && lyr.pageItems.length > 0) {" +
      "  for (var i=0; i<lyr.pageItems.length; i++) {" +
      "    if (lyr.pageItems[i].typename == 'PathItem') {" +
      "       strokeW = lyr.pageItems[i].strokeWidth;" +
      "       break;" + // take first path
      "    }" +
      "  }" +
      "}" +
      "strokeW;";

    // Send to Illustrator
    var bt = new BridgeTalk();
    bt.target = "illustrator";
    bt.body = illusScript;

    bt.onResult = function (res) {
      var val = res.body;
      if (val == "-1") {
        resultText.text = "No stroke found in Hand layer!";
      } else {
        resultText.text = "Hand Stroke Width: " + val;
      }
    };

    bt.onError = function (err) {
      alert("Illustrator error: " + err.body);
    };

    bt.send();
  };

  win.center();
  win.show();
})();
