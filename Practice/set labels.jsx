var comp = app.project.activeItem;

if (!comp || !(comp instanceof CompItem)) {
  alert("Select a composition first");
} else {
  var layer = comp.layer("Hand L");

  // AE label indices: 1-16 (colors)
  // Example:
  // 1 = Red, 2 = Yellow, 3 = Aqua, 4 = Pink, 5 = Lavender
  // 6 = Peach, 7 = Seafoam, 8 = Blue, 9 = Bright Green
  // 10 = Orange, 11 = Brown, 12 = Tan, 13 = Cyan
  // 14 = Fuchsia, 15 = Purple, 16 = None

  // 2, 14, 10, 9

  layer.label = 9; // Bright Green
}
