(function (thisObj) {
  function characterSetup(thisObj) {
    function stringify(obj) {
      if (obj === null) return "null";
      if (typeof obj === "number" || typeof obj === "boolean")
        return obj.toString();
      if (typeof obj === "string") return '"' + obj.replace(/"/g, '\\"') + '"';
      if (obj.constructor === Array) {
        var res = [];
        for (var i = 0; i < obj.length; i++) res.push(stringify(obj[i]));
        return "[" + res.join(",") + "]";
      }
      if (obj.constructor === Object) {
        var res = [];
        for (var key in obj) {
          res.push('"' + key + '":' + stringify(obj[key]));
        }
        return "{" + res.join(",") + "}";
      }
      return '""';
    }
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
      if (!contents) {
        // alert("No ADBE Root Vectors Group found in layer: " + layer.name);
        return properties;
      }
      for (var i = 1; i <= contents.numProperties; i++) {
        var object = {
          layer: layer,
          layerName: layer.name,
          groupName: contents.property(i).name,
          properties: [],
        };
        var shapeGroup = contents.property(i).property("ADBE Vectors Group");
        if (!shapeGroup) {
          alert(
            "No ADBE Vectors Group found in content: " +
              contents.property(i).name
          );
          continue;
        }
        var stroke = shapeGroup.property("ADBE Vector Graphic - Stroke");
        if (stroke) {
          var strokeWidth = stroke.property("ADBE Vector Stroke Width");
          if (!strokeWidth) {
            alert(
              "No Stroke Width property found in stroke group: " +
                shapeGroup.name
            );
          } else {
            object.properties.push({
              name: "Stroke Width",
              property: strokeWidth,
            });
          }
        }
        var trim = shapeGroup.property("ADBE Vector Filter - Trim");
        if (trim) {
          var trimStart = trim.property("ADBE Vector Trim Start");
          var trimEnd = trim.property("ADBE Vector Trim End");
          if (!trimStart || !trimEnd) {
            alert(
              "Missing Trim Start or Trim End properties in trim filter: " +
                shapeGroup.name
            );
          } else {
            object.properties.push({
              name: "Trim Start",
              property: trimStart,
            });
            object.properties.push({
              name: "Trim End",
              property: trimEnd,
            });
          }
        }
        properties.push(object);
      }
      return properties;
    }
    function parseJSON(str) {
      // Remove leading/trailing spaces
      str = str.replace(/^\s+|\s+$/g, "");
      // Strings must use double quotes in valid JSON
      // So we can safely use eval with parentheses
      try {
        return new Function("return " + str)();
      } catch (e) {
        alert("Error parsing JSON: " + e.toString());
        return null;
      }
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
        if (!singleProperty || !nextSingleProperty) {
          alert(
            "Mismatch in paired properties for " + label + " at index " + i
          );
          continue;
        }
        var rowContainer1 = addContainer(parent, "row", "left");
        for (var j = 0; j < singleProperty.length; j++) {
          var prop = singleProperty[j];
          var nextProp = nextSingleProperty[j];
          if (!prop || !nextProp) {
            // alert("Property missing at index " + j + " for " + label);
            continue;
          }
          if (prop.groupName.indexOf("Path Guide") === 0) {
            continue;
          }
          var columnContainer = addContainer(parent, "column", "left");
          var rowContainer = addContainer(columnContainer, "row", "left");
          addTextUI(rowContainer, prop.groupName);
          var columnContainer1 = addContainer(rowContainer, "column", "left");
          if (prop.properties.length == 0) {
            alert("No properties found for group: " + prop.groupName);
            continue;
          }
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
        if (l.name.toLowerCase().indexOf(name.toLowerCase()) === 0) return l;
      }
      return null;
    }
    // Function to update the UI
    function updateUI() {
      try {
        // Remove all existing elements
        while (win.children.length > 0) {
          win.remove(win.children[0]);
        }
        // Get the active composition
        var comp = app.project.activeItem;
        // Check if a composition is active
        if (!comp || !(comp instanceof CompItem)) {
          win.add("statictext", undefined, "Please select a composition.");
          // Add a refresh button
          var refreshBtn = win.add("button", undefined, "Refresh");
          refreshBtn.preferredSize.width = 100;
          refreshBtn.onClick = function () {
            updateUI();
            win.layout.layout(true);
          };
          win.layout.layout(true);
          return;
        }
        var characterTags = ["M-", "E-", "W-"];
        // Add a refresh button
        var refreshBtn = win.add("button", undefined, "Refresh");
        refreshBtn.preferredSize.width = 100;
        refreshBtn.onClick = function () {
          updateUI();
          win.layout.layout(true);
        };
        var found = false;
        for (var i = 0; i < characterTags.length; i++) {
          if (comp.name.indexOf(characterTags[i]) >= 0) {
            found = true;
            break; // no need to continue checking
          }
        }
        if (!found) {
          win.add(
            "statictext",
            undefined,
            "Please select a Character composition."
          );
          win.layout.layout(true);
          return;
        }
        // Set the window title to the composition name
        win.text = comp.name;
        // Find layers by partial name
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
        // Add a text field to display the timestamp
        var timeText = win.add("statictext", undefined, getCurrentTime());
        timeText.preferredSize.width = 200;

        // Update window layout
        win.layout.layout(true);
      } catch (e) {
        alert("Error updating UI: " + e.toString());
      }
    }

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
      // "Color",
      // "Character",
      "Guide",
      "Path Position",
      "Full Guide",
      "Hand and Feet",
    ];

    // Initial UI setup
    try {
      updateUI();
    } catch (e) {
      alert("Error initializing UI: " + e.toString());
    }
    if (win instanceof Window) {
      // Show the window
      win.center();
      win.show();
    }
  }
  characterSetup(thisObj);
})(this);
