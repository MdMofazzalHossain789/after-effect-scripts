(function () {
  // Create a window
  var win = new Window("palette", "Character Setup (Infonimados)", undefined, {
    resizeable: true,
  });
  win.orientation = "column";
  win.alignChildren = ["fill", "top"];
  win.spacing = 10;
  win.margins = 16;

  // Function to get current time
  function getCurrentTime() {
    var now = new Date();
    return now.toLocaleString();
  }

  function findLayersByPartialName(comp, name, ignoreLayers) {
    var layers = [];
    for (var i = 1; i <= comp.numLayers; i++) {
      var l = comp.layer(i);
      var shouldIgnore = false;
      if (ignoreLayers && ignoreLayers.length > 0) {
        for (var j = 0; j < ignoreLayers.length; j++) {
          var ignoreLayer = ignoreLayers[j];
          if (l.name.indexOf(ignoreLayer) === 0) {
            shouldIgnore = true;
            break;
          }
        }
      }
      if (shouldIgnore) continue;
      if (l.name.indexOf(name) === 0) layers.push(l);
    }
    return layers;
  }

  // Get stroke and trim properties from a layer
  function getStrokeTrimProperties(layer) {
    var properties = [];
    var contents = layer.property("ADBE Root Vectors Group");
    if (!contents) return properties;

    for (var i = 1; i <= contents.numProperties; i++) {
      var object = {
        layer: layer,
        layerName: layer.name,
        groupName: contents.property(i).name,
        properties: [],
      };
      var shapeGroup = contents.property(i).property("ADBE Vectors Group");
      var stroke = shapeGroup.property("ADBE Vector Graphic - Stroke");
      if (stroke) {
        var strokeWidth = stroke.property("ADBE Vector Stroke Width");
        object.properties.push({ name: "Stroke Width", property: strokeWidth });
      }
      var trim = shapeGroup.property("ADBE Vector Filter - Trim");
      if (trim) {
        object.properties.push({
          name: "Trim Start",
          property: trim.property("ADBE Vector Trim Start"),
        });
        object.properties.push({
          name: "Trim End",
          property: trim.property("ADBE Vector Trim End"),
        });
      }
      properties.push(object);
    }
    return properties;
  }

  function addContainer(parent, direction, align) {
    var rowContainer = parent.add("group");
    rowContainer.orientation = direction;
    rowContainer.alignChildren = align;
    return rowContainer;
  }

  function addTextUI(panel, label) {
    var nameText = panel.add("statictext", undefined, label);
    nameText.minimumSize.width = 100;
  }

  function addDividerUI(parent) {
    var divider = parent.add("panel");
    divider.alignment = "fill";
    divider.preferredSize = [0, 2];
  }

  // Function to update the UI
  function updateUI() {
    // Remove all existing elements
    while (win.children.length > 0) {
      win.remove(win.children[0]);
    }

    // Get the active composition
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
      alert("Please select a composition.");
      return;
    }
    win.text = comp.name;

    // Find layers
    var hands = findLayersByPartialName(comp, "Hand", ["Hand and Feet"]);
    var legs = findLayersByPartialName(comp, "Feet", ["Hand and Feet"]);

    var handsProperties = [];
    var legsProperties = [];

    for (var i = 0; i < hands.length; i++) {
      var hand = hands[i];
      var properties = getStrokeTrimProperties(hand);
      handsProperties.push(properties);
    }

    for (var i = 0; i < legs.length; i++) {
      var leg = legs[i];
      legsProperties.push(getStrokeTrimProperties(leg));
    }

    var layerNameText = win.add("statictext", undefined, "Hands L/R");
    layerNameText.preferredSize.width = 200;
    addDividerUI(win);

    for (var i = 0; i < handsProperties.length / 2; i++) {
      var handProperty = handsProperties[i];
      var nextHandProperty = handsProperties[i + 1];

      var rowContainer1 = addContainer(win, "row", "left");
      for (var j = 0; j < handProperty.length; j++) {
        var prop = handProperty[j];
        var nextProp = nextHandProperty[j];

        var columnContainer = addContainer(rowContainer1, "column", "left");
        var rowContainer = addContainer(columnContainer, "row", "left");
        addTextUI(rowContainer, prop.groupName);

        var propColumn = addContainer(rowContainer, "column", "left");
        for (var k = 0; k < prop.properties.length; k++) {
          var propRow = addContainer(propColumn, "row", "left");
          addTextUI(propRow, prop.properties[k].name);

          // Add input field
          var input = propRow.add(
            "edittext",
            undefined,
            prop.properties[k].property.value.toString()
          );
          input.characters = 5;

          // Add slider
          var slider = propRow.add(
            "slider",
            [0, 0, 150, 20],
            0,
            100,
            prop.properties[k].property.value
          );
          //   slider.preferredSize.width = 150;

          // Capture properties, input, and slider in closure
          (function (property, nextProperty, inputField, sliderControl) {
            inputField.onChanging = function () {
              var val = parseFloat(this.text.replace(/[^\d.-]/g, ""));
              if (isNaN(val) || val < 0) val = 0;
              app.beginUndoGroup("Change Property Value");
              try {
                property.setValue(val);
                nextProperty.setValue(val);
                this.text = property.value.toString();
                sliderControl.value = val; // Sync slider with input
              } catch (e) {
                alert("Error setting value: " + e.toString());
              }
              app.endUndoGroup();
            };

            sliderControl.onChanging = function () {
              var val = this.value;
              app.beginUndoGroup("Change Property Value with Slider");
              try {
                property.setValue(val);
                nextProperty.setValue(val);
                inputField.text = val.toString(); // Sync input with slider
              } catch (e) {
                alert("Error setting value: " + e.toString());
              }
              app.endUndoGroup();
            };
          })(
            prop.properties[k].property,
            nextProp.properties[k].property,
            input,
            slider
          );
        }
        addDividerUI(columnContainer);
      }
    }

    var timeText = win.add("statictext", undefined, getCurrentTime());
    timeText.preferredSize.width = 200;

    var refreshBtn = win.add("button", undefined, "Refresh");
    refreshBtn.preferredSize.width = 100;
    refreshBtn.onClick = function () {
      updateUI();
    };

    win.layout.layout(true);
  }

  updateUI();
  win.center();
  win.show();
})();
