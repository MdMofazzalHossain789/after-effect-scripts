(function (thisObj) {
  function characterSetup(thisObj) {
    // Create a window
    var win =
      thisObj instanceof Panel
        ? thisObj
        : new Window("palette", "Character Setup (Infonimados)", undefined, {
            resizeable: true,
          });
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 10;
    win.margins = 10;

    var ignoreLayers = [
      //   "Color",
      //   "Character",
      "Guide",
      "Path Position",
      "Full Guide",
      "Hand and Feet",
    ];

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
          object.properties.push({
            name: "Stroke Width",
            property: strokeWidth,
          });
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

      if (arrayOfProperties.length === 0) {
        parent.add("statictext", undefined, "No " + label + " shapes found");

        return;
      }
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

    function isThis(layerName, name) {
      if (layerName.indexOf(name) === 0) {
        return true;
      } else {
        return false;
      }
    }

    function findLayer(comp, name) {
      for (var i = 1; i <= comp.numLayers; i++) {
        var l = comp.layer(i);
        if (l.name.indexOf(name) === 0) return l;
      }
      return null;
    }

    function setParents() {
      var comp = app.project.activeItem; // <-- re-fetch here
      if (!comp || !(comp instanceof CompItem)) {
        alert("Please select a comp first");
        return;
      }
      app.beginUndoGroup("Set Parents to Character");
      for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        var layerName = layer.name;

        // Check if this layer should be ignored
        var ignore = false;
        for (var j = 0; j < ignoreLayers.length; j++) {
          if (layer.locked) layer.locked = false;
          if (layer.canSetCollapseTransformation) {
            // AI layer
            layer.collapseTransformation = true;
          }
          if (layerName.indexOf(ignoreLayers[j]) === 0) {
            if (!layer.locked) layer.locked = true;
            ignore = true;
            break; // no need to check other ignore names
          }
        }

        if (ignore) continue; // skip this layer

        // Your code for layers you want to process
        if (isThis(layerName, "Brow")) {
          var parent = findLayer(comp, "Head");
          layer.parent = parent;
        } else if (isThis(layerName, "Pupil")) {
          layer.parent = findLayer(comp, "Eyes");
        } else if (isThis(layerName, "Eyes")) {
          layer.parent = findLayer(comp, "Head");
        } else if (isThis(layerName, "Mouth")) {
          layer.parent = findLayer(comp, "Head");
        } else if (isThis(layerName, "Head")) {
          layer.parent = findLayer(comp, "Body");
        } else if (isThis(layerName, "Feet")) {
          layer.parent = findLayer(comp, "Character");
        } else if (isThis(layerName, "Hand")) {
          layer.parent = findLayer(comp, "Body");
        } else if (isThis(layerName, "Body")) {
          layer.parent = findLayer(comp, "Character");
        } else if (isThis(layerName, "Color")) {
          layer.parent = findLayer(comp, "Character");
        }
      }
      app.endUndoGroup(); // <-- re-fetch here
    }

    function getRandomFromArray(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function setLabel() {
      var randomLabel = getRandomFromArray([2, 9, 11, 13]);
      // alert(randomLabel);

      var red = ["Character"];

      var none = ["Guide", "Path Position", "Full Guide", "Hand and Feet"];

      var comp = app.project.activeItem;

      if (!comp || !(comp instanceof CompItem)) {
        alert("Select a composition first");
      }

      app.beginUndoGroup("Set Labels");

      for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);

        layer.label = randomLabel;

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

      app.endUndoGroup();
    }

    function renameLayers() {
      var comp = app.project.activeItem;

      if (!comp || !(comp instanceof CompItem)) {
        alert("Select a composition first");
      } else {
        app.beginUndoGroup("Rename Layers");

        var layer = findLayer(comp, "Character ");

        if (layer) {
          layer.name = comp.name + " Null";
        }

        layer = findLayer(comp, "Color");
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

          // alert("Layer renamed and expressions updated!");
        }
        app.endUndoGroup();
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
        // alert("Please select a composition.");
        win.add("statictext", undefined, "Please select a composition.");
        // Add a refresh button
        var refreshBtn = win.add("button", undefined, "Refresh");
        refreshBtn.preferredSize.width = 100;

        // Refresh button click handler
        refreshBtn.onClick = function () {
          updateUI();
          win.layout.layout(true);
        };
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

      // Add a refresh button
      var refreshBtn = win.add("button", undefined, "Refresh");
      refreshBtn.preferredSize.width = 100;

      // Refresh button click handler
      refreshBtn.onClick = function () {
        updateUI();
        win.layout.layout(true);
      };

      var tabs = win.add("tabbedpanel");
      tabs.alignChildren = ["fill", "fill"];
      tabs.preferredSize = [400, 300];

      var handsTab = tabs.add("tab", undefined, "Hands");
      var feetTab = tabs.add("tab", undefined, "Feet");

      // Add content to Hands
      addCharacterControlUI("Hands L/R", handsProperties, handsTab);

      // Add content to Feet
      addCharacterControlUI("Feet L/R", legsProperties, feetTab);

      tabs.selection = handsTab; // default

      // alert("Hands - " + hands.length + " Legs - " + legs.length);

      // Add a text field to display the timestamp
      var timeText = win.add("statictext", undefined, getCurrentTime());
      timeText.preferredSize.width = 200;

      var completeBtn = win.add(
        "button",
        undefined,
        "Set Labels, Parents and Rename Layers"
      );
      refreshBtn.preferredSize.width = 100;
      completeBtn.enabled = handsProperties.length > 0;

      // Refresh button click handler
      completeBtn.onClick = function () {
        if (handsProperties.length > 0 && legsProperties.length > 0) {
          setLabel();
          setParents();
          renameLayers();
          completeBtn.enabled = false;
        }
      };

      // Update window layout

      win.layout.layout(true);
    }

    // Initial UI setup
    updateUI();

    // Show the window
    win.center();
    win.show();
  }

  characterSetup(thisObj);
})(this);
