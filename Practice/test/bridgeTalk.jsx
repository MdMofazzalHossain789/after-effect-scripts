(function () {
  var win = new Window("palette", "AI Stroke Reader", undefined);
  win.orientation = "column";
  win.alignChildren = ["fill", "top"];

  var btn = win.add("button", undefined, "Pick AI & Get Stroke");
  var resultText = win.add("statictext", undefined, "Stroke Width: --", {
    multiline: true,
  });

  btn.onClick = function () {
    var aiFile = File.openDialog("Select an Illustrator File", "*.ai");
    if (!aiFile) return;

    var targetLayer = "Layer 1"; // 👈 change to the Illustrator layer name you want

    // Illustrator script as a string
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
      "if (lyr && lyr.pathItems.length > 0) {" +
      "    strokeW = lyr.pathItems[0].strokeWidth;" +
      "}" +
      "strokeW;";

    // BridgeTalk send
    var bt = new BridgeTalk();
    bt.target = "illustrator";
    bt.body = illusScript;

    bt.onResult = function (res) {
      resultText.text = "Stroke Width: " + res.body;
    };

    bt.onError = function (err) {
      alert("Error: " + err.body);
    };

    bt.send();
  };

  win.center();
  win.show();
})();
