var width = 300;
var height = 200;
var screenWidth = $.screens[0].right;
var screenHeight = $.screens[0].bottom;

var win =
  this instanceof Panel
    ? this
    : new Window(
        "palette",
        "My UI",
        [
          (screenWidth - width) / 2,
          (screenHeight - height) / 2,
          (screenWidth + width) / 2,
          (screenHeight + height) / 2,
        ],
        {
          resizeable: true,
        }
      );

win.show();
