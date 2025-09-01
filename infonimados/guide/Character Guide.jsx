(function (thisObj) {
  function main(thisObject) {
    var comp = app.project.activeItem;

    if (!(comp && comp instanceof CompItem)) {
      alert("Please open a composition.");
      return;
    }

    var win =
      thisObject instanceof Panel
        ? thisObject
        : new Window("palette", "Character Guide", undefined, {
            resizeable: true,
          });

    win.orientation = "column";
    win.alignChildren = "left";
    win.spacing = 5;
    win.margins = 10;

    var mainGroup = win.add("group");

    mainGroup.add("statictext", undefined, "Character Guide");

    win.layout.layout(true);

    if (win instanceof Window) {
      win.center(); // ensures visibility when running from Scripts
      win.show();
    }
  }

  main(thisObj);
})(this);
