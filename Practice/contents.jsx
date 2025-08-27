var win =
  this instanceof Window
    ? this
    : new Window("palette", "Contents", undefined, { resizeable: true });

win.minimumSize.width = 200;
win.minimumSize.height = 200;

var group = win.add("group");
group.orientation = "column";
group.alignChildren = ["fill", "top"];

var refreshButton = group.add("button", undefined, "Refresh");

win.center();
win.show();
