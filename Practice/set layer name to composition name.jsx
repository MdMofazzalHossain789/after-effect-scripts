var comp = app.project.activeItem;

function findLayer(name) {
  for (var i = 1; i <= comp.numLayers; i++) {
    var l = comp.layer(i);
    if (l.name.indexOf(name) === 0) return l;
  }
  return null;
}

if (!comp || !(comp instanceof CompItem)) {
  alert("Select a composition first");
} else {
  var layer = findLayer("Color");
  // Old and new layer names

  // Find the layer
  if (!layer) {
    alert("Layer '" + oldName + "' not found!");
  } else {
    // Rename the layer
    var oldName = layer.name;
    var newName = "Color " + comp.name;

    layer.name = newName;

    // Loop through all layers in the comp
    for (var i = 1; i <= comp.numLayers; i++) {
      var l = comp.layer(i);

      // Recursively check all properties of the layer
      function updateExpressions(propGroup) {
        for (var j = 1; j <= propGroup.numProperties; j++) {
          var prop = propGroup.property(j);

          // If the property has an expression, replace old layer name with new
          if (prop.expression) {
            prop.expression = prop.expression.replace(
              new RegExp(oldName, "g"),
              newName
            );
          }

          // If the property has sub-properties (like groups), recurse
          if (prop.numProperties && prop.numProperties > 0) {
            updateExpressions(prop);
          }
        }
      }

      updateExpressions(l);
    }

    alert("Layer renamed and expressions updated!");
  }
}
