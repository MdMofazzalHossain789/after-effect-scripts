var width = 300;
var height = 200;
var screenWidth = $.screens[0].right;
var screenHeight = $.screens[0].bottom;

var win =
  this instanceof Panel
    ? this
    : new Window("palette", "My UI", undefined, {
        resizeable: true,
      });

// ✅ set minimum width & height
win.minimumSize.width = 200;
win.minimumSize.height = 150;

// adding button to the window
var button = win.add("button", undefined, "Click Me!");

// adding text to the window
var text = win.add("statictext", undefined, "Hello world!");

// adding input field to the window
var input = win.add("edittext", undefined, "Type here");

// adding checkbox to the window
var checkbox = win.add("checkbox", undefined, "Enable");

// adding dropdown to the window
var dropdown = win.add("dropdownlist", undefined, [
  "Option 1",
  "Option 2",
  "Option 3",
]);

// adding list box to the window
var listbox = win.add("listbox", undefined, ["Item 1", "Item 2", "Item 3"], {
  multiselect: true,
});

// For layout to refresh after adding button or elements
win.layout.layout(true);
// win.center();

if (win instanceof Window) {
  win.show();
}

button.onClick = function () {
  alert("Button Clicked!");
};

checkbox.onClick = function () {
  alert("Checkbox state: " + (checkbox.value ? "Checked" : "Unchecked"));
};

dropdown.onChange = function () {
  alert("Selected: " + dropdown.selection.text);
};

input.onChange = function () {
  alert("Input value: " + input.text);
};
