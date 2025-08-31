(function (thisObj) {
  function showCharacterSetup() {
    var newWin = new Window(
      "palette",
      "Character Setup (Infonimados)",
      undefined,
      { resizeable: true }
    );

    newWin.orientation = "column";
    newWin.alignChildren = ["fill", "top"];
    newWin.spacing = 10;
    newWin.margins = 10;

    var button = newWin.add("button", undefined, "Character Setup");
    button.onClick = function () {
      alert("Clicked");
    };

    newWin.show();
    return newWin;
  }

  function characterSetup(thisObj) {
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

    var newWin;

    var windowButtons = [
      { name: "Character Setup", fn: showCharacterSetup },
      { name: "Set Character Labels", fn: showCharacterSetup },
      { name: "Rename Character Layers", fn: showCharacterSetup },
      { name: "Set Character Parents", fn: showCharacterSetup },
      { name: "Trim Paths", fn: showCharacterSetup },
    ];

    try {
      for (var i = 0; i < windowButtons.length; i++) {
        (function (iCopy) {
          var charButton = win.add(
            "button",
            undefined,
            windowButtons[iCopy].name
          );
          charButton.onClick = function () {
            if (newWin) {
              newWin.close(true);
            }
            newWin = windowButtons[iCopy].fn();
          };
        })(i);
      }
    } catch (e) {
      alert("Error initializing UI: " + e.toString());
    }

    if (win instanceof Window) {
      win.center();
      win.show();
    }
  }

  characterSetup(thisObj);
})(this);
