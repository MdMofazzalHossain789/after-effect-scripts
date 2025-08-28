function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

var randomLabel = getRandomFromArray([2, 9, 11, 13]);
// alert(randomLabel);

var red = ["Character"];

var none = ["Guide", "Path Position", "Full Guide", "Hand and Feet"];

var comp = app.project.activeItem;

if (!comp || !(comp instanceof CompItem)) {
  alert("Select a composition first");
}

for (var i = 1; i <= comp.numLayers; i++) {
  var layer = comp.layer(i);

  layer.label = 13;

  for (var j = 0; j < red.length; j++) {
    if (layer.name.indexOf(red[j]) === 0) {
      layer.label = 1;
    }
  }

  for (var j = 0; j < none.length; j++) {
    if (layer.name.indexOf(none[j]) === 0) {
      layer.label = 0;
      layer.locked = true;
    }
  }
}
