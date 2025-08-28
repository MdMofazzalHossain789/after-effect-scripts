// Create a floating palette window
var win = new Window("palette", "Number Input Example", undefined);
win.orientation = "row";

// Label
win.add("statictext", undefined, "Value:");

// Number input field (edittext)
var numInput = win.add("edittext", undefined, "50");
numInput.characters = 5; // width

// Make it behave like a number field (restrict input)
numInput.onChanging = function () {
  // only allow numbers
  this.text = this.text.replace(/[^\d.-]/g, "");
};

// Optional: Add a slider to mimic AE style
var slider = win.add("slider", undefined, 50, 0, 100);
slider.preferredSize.width = 150;

// Sync slider and number input
slider.onChanging = function () {
  numInput.text = Math.round(this.value);
};
numInput.onChange = function () {
  var val = parseFloat(this.text);
  if (!isNaN(val)) slider.value = val;
};

// Show window
win.center();
win.show();
