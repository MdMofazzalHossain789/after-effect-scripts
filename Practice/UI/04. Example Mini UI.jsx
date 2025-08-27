(function (thisObj) {
  var win =
    thisObj instanceof Panel
      ? thisObj
      : new Window("palette", "Demo UI", undefined, { resizeable: true });

  var txt = win.add("statictext", undefined, "Enter name:");
  var input = win.add("edittext", [0, 0, 200, 25], "");
  var btn = win.add("button", undefined, "Say Hello");

  btn.onClick = function () {
    alert("Hello " + input.text + "!");
  };

  if (win instanceof Window) {
    win.center();
    win.show();
  } else {
    win.layout.layout(true);
  }
})(this);
