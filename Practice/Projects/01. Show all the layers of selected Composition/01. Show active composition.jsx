var window =
  window instanceof Window
    ? this
    : new Window("palette", "Selected Comp", undefined, {
        resizeable: true,
      });

var selectedComp = app.project.activeItem;

if (selectedComp && selectedComp instanceof CompItem) {
  var comp = selectedComp;
  var layers = comp.layers;

  for (var i = 1; i <= layers.length; i++) {
    var layer = layers[i];
    window.add("statictext", [0, 0, 200, 25], "Layer " + i + ": " + layer.name);
  }
  window.show();
} else {
  alert("Select a composition first!");
}
