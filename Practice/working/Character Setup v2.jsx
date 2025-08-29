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

  function addToUI(parentPanel, label) {
    var nameText = parentPanel.add("statictext", undefined, label);
    nameText.preferredSize.width = 150;
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

  function addCharacterControlUI(label, arrayOfProperties, parent) {
    // Container for layers
    var layerNameText = parent.add("statictext", undefined, label);
    layerNameText.preferredSize.width = 200;

    // Add divider under each layer
    var divider = parent.add("panel");
    divider.alignment = "fill";
    divider.preferredSize = [0, 2];

    for (var i = 0; i < arrayOfProperties.length / 2; i++) {
      var singleProperty = arrayOfProperties[i];
      var nextSingleProperty = arrayOfProperties[i + 1];

      var rowContainer1 = addContainer(parent, "row", "left");
      for (var j = 0; j < singleProperty.length; j++) {
        var prop = singleProperty[j];
        var nextProp = nextSingleProperty[j];

        // alert(prop.groupName + " - " + nextProp.groupName);

        var columnContainer = addContainer(parent, "column", "left");
        var rowContainer = addContainer(columnContainer, "row", "left");

        addTextUI(rowContainer, prop.groupName);

        var columnContainer1 = addContainer(rowContainer, "column", "left");

        for (var k = 0; k < prop.properties.length; k++) {
          var rowContainer = addContainer(columnContainer1, "row", "left");
          addTextUI(rowContainer, prop.properties[k].name);

          // Add input field
          var input = rowContainer.add(
            "edittext",
            undefined,
            prop.properties[k].property.value.toString()
          );
          input.characters = 5;

          // Add slider
          var slider = rowContainer.add(
            "slider",
            [0, 0, 200, 25],
            prop.properties[k].property.value, // initial value
            0, // min
            100 // max (adjust as needed)
          );
          (function (property, nextProperty, inputField, sliderField) {
            // While typing → only validate
            inputField.onChanging = function () {
              var val = parseFloat(this.text.replace(/[^\d.-]/g, ""));
              if (!isNaN(val)) {
                // update properties live
                app.beginUndoGroup("Change Property Value");
                try {
                  property.setValue(val);
                  nextProperty.setValue(val);
                  sliderField.value = val; // sync slider
                } catch (e) {
                  alert("Error setting value: " + e.toString());
                }
                app.endUndoGroup();
              }
            };

            // After typing finished → normalize text
            inputField.onChange = function () {
              var val = parseFloat(this.text.replace(/[^\d.-]/g, ""));
              if (isNaN(val)) val = sliderField.minvalue;
              if (val < sliderField.minvalue) val = sliderField.minvalue;
              if (val > sliderField.maxvalue) val = sliderField.maxvalue;

              property.setValue(val);
              nextProperty.setValue(val);
              sliderField.value = val;
              this.text = val.toFixed(1); // normalize AFTER editing is done
            };

            // Slider live update
            sliderField.onChanging = function () {
              var val = sliderField.value;
              app.beginUndoGroup("Change Property Value");
              try {
                property.setValue(val);
                nextProperty.setValue(val);
                inputField.text = val.toFixed(1); // safe here
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
  }

  // Function to update the UI
  function updateUI() {
    // Remove all existing elements
    while (win.children.length > 0) {
      win.remove(win.children[0]);
    }

    // Get the active composition
    var comp = app.project.activeItem;

    // Check if a composition is active
    if (!comp || !(comp instanceof CompItem)) {
      alert("Please select a composition.");
      return;
    }
    // Set the window title to the composition name
    win.text = comp.name;

    // Find layers by partial name and can have ignore list array
    // Arguments (comp, layername [ignore layername 1, ignore layername] 2)
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

    addCharacterControlUI("Hands L/R", handsProperties, win);
    addCharacterControlUI("Feet L/R", legsProperties, win);
    // alert("Hands - " + hands.length + " Legs - " + legs.length);

    // Add a text field to display the timestamp
    var timeText = win.add("statictext", undefined, getCurrentTime());
    timeText.preferredSize.width = 200;

    // Add a refresh button
    var refreshBtn = win.add("button", undefined, "Refresh");
    refreshBtn.preferredSize.width = 100;

    // Refresh button click handler
    refreshBtn.onClick = function () {
      updateUI();
    };

    // Update window layout
    win.layout.layout(true);
  }

  // Initial UI setup
  updateUI();

  // Show the window
  win.center();
  win.show();
})();
