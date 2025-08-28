var comp = app.project.activeItem;
if (!comp || !(comp instanceof CompItem)) {
  alert("Select a composition first");
} else {
  var handL = comp.layer("Hand L");
  var handR = comp.layer("Hand R ");

  if (!handL) alert("Hand L not found");
  if (!handR) alert("Hand R not found");

  // Make Hand R a child of Hand L
  handR.parent = handL;
}
