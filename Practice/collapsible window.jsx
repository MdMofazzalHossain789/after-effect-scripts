(function () {
  var win = new Window("palette", "Collapsible Panel Demo", undefined, {
    resizeable: true,
  });
  win.orientation = "column";
  win.alignChildren = ["fill", "top"];

  // --- Collapsible group wrapper ---
  function createCollapsible(parent, title) {
    var wrapper = parent.add("group");
    wrapper.orientation = "column";
    wrapper.alignChildren = ["fill", "top"];

    // Header bar
    var header = wrapper.add("group");
    header.orientation = "row";
    header.alignChildren = ["left", "center"];

    var toggleBtn = header.add("button", undefined, "▼ " + title); // ▼ open, ► closed
    toggleBtn.alignment = ["fill", "top"];

    // Content group
    var content = wrapper.add("group");
    content.orientation = "column";
    content.alignChildren = ["fill", "top"];
    content.margins = [20, 0, 0, 0]; // indent a bit

    // Toggle behavior
    var isOpen = true;
    toggleBtn.onClick = function () {
      isOpen = !isOpen;
      content.visible = isOpen;
      toggleBtn.text = (isOpen ? "▼ " : "► ") + title;
      win.layout.layout(true); // reflow
    };

    return content; // return the actual content group
  }

  // --- Example usage ---
  var section1 = createCollapsible(win, "Transform Controls");
  section1.add("statictext", undefined, "Position X:");
  section1.add("edittext", undefined, "100");
  section1.add("statictext", undefined, "Scale:");
  section1.add("edittext", undefined, "50");

  var section2 = createCollapsible(win, "Stroke Controls");
  section2.add("statictext", undefined, "Stroke Width:");
  section2.add("edittext", undefined, "10");
  section2.add("statictext", undefined, "Stroke Color:");
  section2.add("edittext", undefined, "#FF0000");

  win.center();
  win.show();
})();
