var dialog = new Window("dialog", "Custom Button Example");
dialog.orientation = "column";

// Create a group to act as a button
var buttonGroup = dialog.add("group");
buttonGroup.size = [100, 30]; // Set size

// Draw a colored background
buttonGroup.graphics.backgroundColor = buttonGroup.graphics.newBrush(
  buttonGroup.graphics.BrushType.SOLID_COLOR,
  [1, 0, 0, 1] // RGBA: Red
);

// Add a static text to mimic button text
var buttonText = buttonGroup.add("statictext", undefined, "Click Me");
buttonText.graphics.foregroundColor = buttonGroup.graphics.newPen(
  buttonGroup.graphics.PenType.SOLID_COLOR,
  [1, 1, 1, 1], // White text
  1
);
buttonText.graphics.font = ScriptUI.newFont("Arial", "BOLD", 12);

// Add click functionality
buttonGroup.addEventListener("click", function () {
  alert("Custom button clicked!");
});

dialog.show();
