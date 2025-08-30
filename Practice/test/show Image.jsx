// Create a script panel
var myPanel =
  this instanceof Panel
    ? this
    : new Window("palette", "Image Panel", undefined, { resizeable: true });

// Define the path to the image (update this to your image file path)
var imagePath = "C:/Windows/Temp/Selection_1.png"; // Replace with actual path, e.g., "C:/Users/YourName/image.png"

// Check if the image file exists
var imageFile = new File(imagePath);
if (imageFile.exists) {
  // Add the image to the panel
  var img = myPanel.add("image", undefined, imageFile);
  img.size = [30, 30]; // Set the size of the image (width, height)
} else {
  alert("Image file not found at: " + imagePath);
}

// Add a button for interaction (optional)
var closeButton = myPanel.add("button", undefined, "Close");
closeButton.onClick = function () {
  if (myPanel instanceof Window) {
    myPanel.close();
  }
};

// Layout the panel
myPanel.layout.layout(true);
myPanel.layout.resize();
myPanel.onResizing = myPanel.onResize = function () {
  this.layout.resize();
};

// Show the panel if it's a window
if (myPanel instanceof Window) {
  myPanel.show();
}
