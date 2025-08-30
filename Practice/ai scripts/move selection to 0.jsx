// Check if there is an active document and a selection
if (app.documents.length > 0 && app.activeDocument.selection.length > 0) {
    var doc = app.activeDocument;
    
    // Set the artboard as the alignment reference
    doc.rulerOrigin = [0, 0]; // Reset ruler origin to artboard
    doc.alignTo = "artboard"; // Align to artboard (optional, depends on version)
    
    // Execute menu commands for horizontal and vertical centering
    app.executeMenuCommand("Vertical Align Center"); // Set alignment to artboard
    app.executeMenuCommand("Horizontal Align Center"); // Horizontal center alignment
    //app.executeMenuCommand("vertical center");   // Vertical center alignment
} else {
    alert("Please select at least one object in an active document.");
}