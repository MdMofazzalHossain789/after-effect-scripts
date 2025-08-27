(function (thisObj) {
  function buildUI(thisObj) {
    var panel =
      thisObj instanceof Panel
        ? thisObj
        : new Window("palette", "Shape Group Lister", undefined, {
            resizeable: true,
          });
    panel.orientation = "column";
    panel.alignChildren = "fill";

    // Add a refresh button
    var refreshButton = panel.add("button", undefined, "Refresh");
    refreshButton.onClick = updateGroupList;

    // Add a listbox to display content groups
    var groupList = panel.add("listbox", undefined, [], {
      numberOfColumns: 2,
      showHeaders: true,
      columnTitles: ["#", "Group Name"],
      columnWidths: [30, 250],
      multiselect: true,
    });

    // Function to recursively collect all content groups
    function collectGroups(group, groupList, index) {
      if (!group || !group.numProperties) return index;
      for (var i = 1; i <= group.numProperties; i++) {
        var prop = group.property(i);
        if (prop.matchName === "ADBE Vector Group") {
          var groupName = prop.name || "Unnamed Group " + index;
          groupList.add("item", index.toString());
          groupList.items[groupList.items.length - 1].subItems[0].text =
            groupName;
          index++;
          // Recurse into nested groups
          var subGroup =
            prop.property("ADBE Vectors Group") ||
            prop.property("ADBE Vector Group Content");
          if (subGroup) {
            index = collectGroups(subGroup, groupList, index);
          }
        }
      }
      return index;
    }

    // Function to update the list with content groups
    function updateGroupList() {
      groupList.removeAll(); // Clear existing items
      var comp = app.project.activeItem;
      if (!comp || !(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
      }

      var layer = comp.selectedLayers[0]; // Get the first selected layer
      if (!layer || !(layer instanceof ShapeLayer)) {
        alert("Please select a shape layer.");
        return;
      }

      var shapeContent = layer.property("ADBE Root Vectors Group");
      if (shapeContent) {
        var index = 1;
        index = collectGroups(shapeContent, groupList, index);
        if (index === 1) {
          alert("No content groups found in the selected shape layer.");
        } else {
          alert(
            "Found " + (index - 1) + " content group(s) in " + layer.name + "."
          );
        }
      } else {
        alert("No content groups found in the selected shape layer.");
      }
    }

    panel.layout.layout(true);
    return panel;
  }

  var customPanel = buildUI(thisObj);
  if (customPanel instanceof Window) {
    customPanel.center();
    customPanel.show();
  }
})(this);
