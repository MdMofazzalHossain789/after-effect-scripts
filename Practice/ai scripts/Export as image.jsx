// Export each top-level group in a specific layer as PNG
function exportGroupsAsPNG(layer) {
    if (!layer) {
        alert("Layer not found!");
        return;
    }

    var doc = app.activeDocument;

    // Folder to save PNGs
    var exportFolder = new Folder("F:\\AI_Exports");
    if (!exportFolder.exists) exportFolder.create();

    for (var i = 0; i < layer.pageItems.length; i++) {
        var item = layer.pageItems[i];
        if (item.typename === "GroupItem") {

            // Duplicate group to a new temp doc
            var tempDoc = app.documents.add(doc.width, doc.height);
            item.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

            // Export PNG
            var safeName = item.name.replace(/[\\\/:*?"<>|]/g, "_"); // sanitize
            var file = new File(exportFolder.fsName + "/" + safeName + ".png");

            var exportOptions = new ExportOptionsPNG24();
            exportOptions.artBoardClipping = true;
            exportOptions.transparency = true;

            tempDoc.exportFile(file, ExportType.PNG24, exportOptions);

            // Close temp doc without saving
            tempDoc.close(SaveOptions.DONOTSAVECHANGES);
        }
    }

    alert("Groups exported as PNGs!");
}

// Helper: get layer by partial name
function getLayerByPartialName(name) {
    var doc = app.activeDocument;
    for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.name.toLowerCase().indexOf(name.toLowerCase()) === 0 && layer.visible) {
            return layer;
        }
    }
    return null;
}

// Example usage:
var guideLayer = getLayerByPartialName("Hand and feet");
exportGroupsAsPNG(guideLayer);
