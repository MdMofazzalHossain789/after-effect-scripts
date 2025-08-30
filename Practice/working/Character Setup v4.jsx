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
          if (
            layerName.toLowerCase().indexOf(ignoreLayers[j].toLowerCase()) === 0
          ) {
            if (!layer.locked) layer.locked = true;
            ignore = true;
            break; // no need to check other ignore names
          }
        }
        if (ignore) continue; // skip this layer
        // Your code for layers you want to process
        if (isThis(layerName, "Brow")) {
          var parent = findLayer(comp, "Head");
          if (!parent) alert("Parent layer 'Head' not found for Brow");
          layer.parent = parent;
        } else if (isThis(layerName, "Pupil")) {
          var parent = findLayer(comp, "Eyes");
          if (!parent) alert("Parent layer 'Eyes' not found for Pupil");
          layer.parent = parent;
        } else if (isThis(layerName, "Eyes")) {
          var parent = findLayer(comp, "Head");
          if (!parent) alert("Parent layer 'Head' not found for Eyes");
          layer.parent = parent;
        } else if (isThis(layerName, "Mouth")) {
          var parent = findLayer(comp, "Head");
          if (!parent) alert("Parent layer 'Head' not found for Mouth");
          layer.parent = parent;
        } else if (isThis(layerName, "Head")) {
          var parent = findLayer(comp, "Body");
          if (!parent) alert("Parent layer 'Body' not found for Head");
          layer.parent = parent;
        } else if (isThis(layerName, "Feet")) {
          var parent = findLayer(comp, "Character");
          if (!parent) alert("Parent layer 'Character' not found for Feet");
          layer.parent = parent;
        } else if (isThis(layerName, "Hand")) {
          var parent = findLayer(comp, "Body");
          if (!parent) alert("Parent layer 'Body' not found for Hand");
          layer.parent = parent;
        } else if (isThis(layerName, "Body")) {
          var parent = findLayer(comp, "Character");
          if (!parent) alert("Parent layer 'Character' not found for Body");
          layer.parent = parent;
        } else if (isThis(layerName, "Color")) {
          var parent = findLayer(comp, "Character");
          if (!parent) alert("Parent layer 'Character' not found for Color");
          layer.parent = parent;
        }
      }
      app.endUndoGroup(); // <-- re-fetch here
    }
    function getRandomFromArray(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    function setLabel() {
      var randomLabel = getRandomFromArray([2, 9, 11, 13]);
      var red = ["Character"];
      var none = ["Guide", "Path Position", "Full Guide", "Hand and Feet"];
      var comp = app.project.activeItem;
      if (!comp || !(comp instanceof CompItem)) {
        alert("Select a composition first");
        return;
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
        return;
      }
      app.beginUndoGroup("Rename Layers");
      var layer = findLayer(comp, "Character ");
      if (layer) {
        layer.name = comp.name + " Null";
      }
      layer = findLayer(comp, "Color");
      if (!layer) {
        alert("Layer 'Color' not found!");
        return;
      }
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
      app.endUndoGroup();
    }
    function getDataFromIllustrator(panel, win) {
      var comp = app.project.activeItem;
      if (!(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
      }
      var handLayer = null;
      for (var i = 1; i <= comp.numLayers; i++) {
        var l = comp.layer(i);
        if (
          l.name.toLowerCase().indexOf("Hand and Feet guide".toLowerCase()) ===
          0
        ) {
          handLayer = l;
        }
      }
      if (!handLayer) {
        alert("Layer 'Hand and Feet Guide' not found in the comp!");
        return;
      }
      var mainGroup = panel.add("group");
      mainGroup.orientation = "column";
      mainGroup.alignChildren = "fill";
      var text = mainGroup.add(
        "statictext",
        undefined,
        "Getting stroke widths from Illustrator..."
      );
      var footage = handLayer.source;
      if (!(footage instanceof FootageItem)) {
        alert(
          "The Hand and Feet Guide layer is not linked to Illustrator footage."
        );
        return;
      }
      var aiFile = footage.file;
      if (!aiFile || !aiFile.exists) {
        alert("Cannot find Illustrator file path.");
        return;
      }
      var targetLayer = "Hand";
      var illusScript =
        'var f = new File("' +
        aiFile.fsName.replace(/\\/g, "\\\\") +
        '");' +
        "app.open(f);" +
        "function getLayerByPartialName(name) {" +
        " var doc = app.activeDocument;" +
        " for (var i = 0; i < doc.layers.length; i++) {" +
        " var layer = doc.layers[i];" +
        " if (layer.name.toLowerCase().indexOf(name.toLowerCase()) === 0 && layer.visible) {" +
        " return layer;" +
        " }" +
        " }" +
        " alert('No layer found with name starting with: ' + name);" +
        "}" +
        "function getStrokes(layer) {" +
        " var strokes = [];" +
        " for (var j = 0; j < layer.pageItems.length; j++) {" +
        " var item = layer.pageItems[j];" +
        ' if (item.typename === "GroupItem") {' +
        ' alert("Found a group: " + item.name);' +
        " }" +
        " }" +
        " if (strokes.length > 0) {" +
        ' alert("Stroke sizes in layer \'" + layer.name + "\':\\n" + strokes.join(", "));' +
        " } else {" +
        ' alert("No stroked paths found in layer \'" + layer.name + "\'.");' +
        " }" +
        "}" +
        "function saveImage(layerToExport, ext, object) {" +
        " var doc = app.activeDocument;" +
        " var item = layerToExport;" +
        " var bounds = item.visibleBounds;" +
        " var width = bounds[2] - bounds[0];" +
        " var height = bounds[1] - bounds[3];" +
        " if (width <= 0) width = 1;" +
        " if (height <= 0) height = 1;" +
        " var tempDoc = app.documents.add(doc.documentColorSpace, width, height);" +
        " app.activeDocument = tempDoc;" +
        " var newDoc = app.activeDocument;" +
        " newDoc.rulerOrigin = [0, 0];" +
        " var activeLayer = newDoc.activeLayer;" +
        " activeLayer.locked = false;" +
        " activeLayer.visible = true;" +
        " var dup = item.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);" +
        " newDoc.selection = null;" +
        " for (var j = 0; j < activeLayer.pageItems.length; j++) {" +
        " activeLayer.pageItems[j].selected = true;" +
        " }" +
        " app.redraw();" +
        " var dupBounds = dup.visibleBounds;" +
        " var dupWidth = dupBounds[2] - dupBounds[0];" +
        " var dupHeight = dupBounds[1] - dupBounds[3];" +
        " var artboardCenterX = width / 2;" +
        " var artboardCenterY = height / 2;" +
        " var itemCenterX = dupBounds[0] + dupWidth / 2;" +
        " var itemCenterY = dupBounds[3] + dupHeight / 2;" +
        " var deltaX = artboardCenterX - itemCenterX;" +
        " var deltaY = artboardCenterY - itemCenterY;" +
        " dup.translate(deltaX, deltaY);" +
        "var path;" +
        'if ($.os.toLowerCase().indexOf("mac") === 0) {' +
        'path = "/Users/Shared/";' +
        "} else {" +
        'path = "C:/Windows/Temp/";' +
        "}" +
        ' object.image = path + "Selection_" + ext + ".png";' +
        " var file = new File(object.image);" +
        " var exportOptions = new ExportOptionsPNG24();" +
        " exportOptions.artBoardClipping = true;" +
        " exportOptions.transparency = true;" +
        " tempDoc.exportFile(file, ExportType.PNG24, exportOptions);" +
        " tempDoc.close(SaveOptions.DONOTSAVECHANGES);" +
        "}" +
        "function getStroke(layer, data) {" +
        " for (var i = 0; i < layer.pageItems.length; i++) {" +
        " var item = layer.pageItems[i];" +
        ' if (item.typename === "GroupItem") {' +
        " var strokeSizes = [];" +
        " var object = {};" +
        "var runOnce = true;" +
        " for (var j = 0; j < item.pathItems.length; j++) {" +
        " var pathItem = item.pathItems[j];" +
        " if (pathItem.stroked && !pathItem.filled) {" +
        " strokeSizes.push(pathItem.strokeWidth);" +
        " if (runOnce) {" +
        " saveImage(item, i + 1, object);" +
        "runOnce = false;" +
        " }" +
        " }" +
        " }" +
        "if(strokeSizes.length>0) {" +
        "object.strokeSizes = strokeSizes;" +
        " data.push(object);}" +
        '} else {\n      var strokeSizes = [];\n      var object = {};\n      if (item.stroked && !item.filled) {\n        strokeSizes.push(item.strokeWidth);\n        //alert("Stroke Found - " + pathItem.strokeWidth);\n\n        saveImage(item, i + 1, object);\n      }\n      object.strokeSizes = strokeSizes;\n      data.push(object);\n ' +
        " }" +
        " }" +
        "}" +
        "function stringify(obj) {\
  if (obj === null) return 'null';\
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj.toString();\
  if (typeof obj === 'string') return '\"' + obj.replace(/\"/g, '\\\"') + '\"';\
  if (obj.constructor === Array) {\
    var res = [];\
    for (var i=0; i<obj.length; i++) res.push(stringify(obj[i]));\
    return '[' + res.join(',') + ']';\
  }\
  if (obj.constructor === Object) {\
    var res = [];\
    for (var key in obj) {\
      res.push('\"' + key + '\":' + stringify(obj[key]));\
    }\
    return '{' + res.join(',') + '}';\
  }\
  return '\"\"';\
}" +
        "var data = [];" +
        'var guideLayer = getLayerByPartialName("Hand and Feet Guide");' +
        "if (!guideLayer) { alert('No Hand and Feet Guide layer found in Illustrator'); }" +
        "getStroke(guideLayer, data);" +
        "stringify(data);";
      // Send to Illustrator
      var bt = new BridgeTalk();
      bt.target = "illustrator";
      bt.body = illusScript;
      bt.onResult = function (res) {
        var val = res.body;
        if (val == "-1" || val == "[]") {
          alert("No stroke found in Hand and Feet Guide layer!");
          text.text = "❌ Not found any stroke";
        } else {
          text.text = "✅ Strokes Found!";
          var data = parseJSON(val);
          if (!data) return;
          for (var i = 0; i < data.length; i++) {
            var rowLayout = mainGroup.add("group");
            rowLayout.orientation = "row";
            rowLayout.alignChildren = "left";
            var colLayout = rowLayout.add("group");
            colLayout.orientation = "column";
            var image = data[i].image;
            var strokeSizes = data[i].strokeSizes;
            if (!image || !strokeSizes) {
              alert("Invalid data received for stroke " + (i + 1));
              continue;
            }
            rowLayout.add("image", undefined, image);
            for (var j = 0; j < strokeSizes.length; j++) {
              var strokeSize = strokeSizes[j];
              colLayout.add("statictext", undefined, strokeSize.toFixed(2));
            }
          }
          win.layout.layout(true);
        }
      };
      bt.onError = function (err) {
        alert("Illustrator error: " + err.body);
        text.text = "❌ Something went wrong!";
      };
      bt.send();
    }

    function getVisibleLayers(layerName) {
      var comp = app.project.activeItem;
      if (!comp || !(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
      }

      for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        if (
          layer.name.toLowerCase().indexOf(layerName.toLowerCase()) === 0 &&
          layer.enabled
        ) {
          return layer;
        }
      }
      return null;
    }

    function addGreenGuide() {
      var comp = app.project.activeItem;
      if (!comp || !(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
      }

      var guideLayer = getVisibleLayers("Hand and Feet Guide");
      var bodyLayer = getVisibleLayers("Body");

      if (!guideLayer) {
        alert("No Hand and Feet Guide layer found in the comp!");
        return;
      }

      app.beginUndoGroup("Add Fill Effect");
      var duplicatedLayer = guideLayer.duplicate();

      duplicatedLayer.moveAfter(bodyLayer);

      var effects = duplicatedLayer.property("ADBE Effect Parade");

      if (effects) {
        var fill = effects.addProperty("ADBE Fill");
        fill.property("Color").setValue([0, 1, 0]); // Red in RGB [0–1]
      }

      var opacityProp = duplicatedLayer
        .property("ADBE Transform Group")
        .property("ADBE Opacity");

      if (opacityProp) {
        opacityProp.setValue(70); // set to 50%
      }

      app.endUndoGroup();
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
        var guideTab = tabs.add("tab", undefined, "Hand and Feet Guide");
        var handsTab = tabs.add("tab", undefined, "Hands");
        var feetTab = tabs.add("tab", undefined, "Feet");
        // Add content to Hands
        addCharacterControlUI("Hands L/R", handsProperties, handsTab);
        // Add content to Feet
        addCharacterControlUI("Feet L/R", legsProperties, feetTab);
        getDataFromIllustrator(guideTab, win);

        var addGreenGuideBtn = win.add("button", undefined, "Add Green Guide");
        addGreenGuideBtn.onClick = function () {
          addGreenGuide();
        };

        tabs.selection = guideTab; // default
        // Add a text field to display the timestamp
        var timeText = win.add("statictext", undefined, getCurrentTime());
        timeText.preferredSize.width = 200;
        var completeBtn = win.add(
          "button",
          undefined,
          "Set Labels, Parents and Rename Layers"
        );
        completeBtn.preferredSize.width = 200;
        completeBtn.enabled =
          handsProperties.length > 0 && legsProperties.length > 0;
        completeBtn.onClick = function () {
          if (handsProperties.length > 0 && legsProperties.length > 0) {
            setLabel();
            setParents();
            renameLayers();
            completeBtn.enabled = false;
          } else {
            alert("No hands or feet properties found to process.");
          }
        };
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
