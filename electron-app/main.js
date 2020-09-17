const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'Production';

let settings = {};

settings.settingsFileName = "settings.json";

settings.imageDirectories = {
  "backgrounds": null,
  "characters": null,
  "costumes": null,
  "emotions": null,
};

settings.transformInfo = {};

app.disableHardwareAcceleration(); // fixes SLOBS blank screen bug

app.on('ready', function () {
  loadOrCreateSettings(settingsFileExisted => {
    createControlWindow(() => {
      if (settingsFileExisted) {
        // If any image directories saved in loaded settings file, load
        // those images as buttons in control window.
        Object.keys(settings.imageDirectories).forEach(layer => {
          if (settings.imageDirectories[layer] != null) {
            loadImages(layer);
          }
        });
      }
    });
    createDisplayWindow();
  });
})

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (controlWindow === null) {
    createControlWindow();
  }
})

function loadOrCreateSettings(callback) {
  fs.exists(settings.settingsFileName, (exists) => {
    if (exists) {
      fs.readFile(settings.settingsFileName, function (err, data) {
        if (err) {
          console.error("Error reading settings.json");
          // does it not exist? thus create?
          return;
        }
        settings = JSON.parse(data);
        callback(true);
      });
    } else {
      callback(false);
      // create settings file if it does not already exist
      fs.writeFile(settings.settingsFileName, JSON.stringify(settings), () => { });
    }
  });
}


// Control Window
let controlWindow;

async function createControlWindow(callback) {
  controlWindow = new BrowserWindow({
    width: 700,
    height: 800,
    x: 100,
    y: 200,
    webPreferences: {
      nodeIntegration: true
    }
  });
  if (process.env.NODE_ENV !== 'Production') {
    controlWindow.webContents.openDevTools();
  }
  controlWindow.loadFile('controlWindow.html').then(callback);
  controlWindow.on('closed', () => controlWindow = null);
}

// Listen for `showImage` event from mainWindow, emit a new one to the displayWindow
ipcMain.on('showImage', function (e, layer, fileName) {
  const fileLocator = path.join(settings.imageDirectories[layer], fileName);
  let left = 0;
  let top = 0;
  let height = null;
  if (settings.transformInfo.hasOwnProperty(fileLocator) == true) {
    left = settings.transformInfo[fileLocator].left;
    top = settings.transformInfo[fileLocator].top;
    height = settings.transformInfo[fileLocator].height;
  }
  displayWindow.webContents.send('showImage', layer, settings.imageDirectories[layer], fileName, left, top, height);
});

ipcMain.on('setImageDirectory', function (e, layer) {
  setImageDirectory(layer);
});

ipcMain.on('editImageMode:true', function (e, layer) {
  displayWindow.webContents.send("editImageMode:true", layer);
});

ipcMain.on("editImageMode:false", function (e, imageFile, left, top, height) {
  if (imageFile != null) {
    console.log(`Saving image '${imageFile}' at left ${left}, top ${top}.`);
    const fileLocator = imageFile;
    settings.transformInfo[fileLocator] = {
      left: left,
      top: top,
      height: height,
    };
    saveSettings();
  }
  controlWindow.webContents.send("editImageMode:false");
});

// Display Window
let displayWindow;

function createDisplayWindow() {
  displayWindow = new BrowserWindow({
    width: 640,
    height: 480,
    x: 800,
    y: 200,
    webPreferences: {
      nodeIntegration: true,
    }
  });
  if (process.env.NODE_ENV !== 'Production') {
    displayWindow.webContents.openDevTools();
  }
  displayWindow.loadFile('displayWindow.html');
  displayWindow.on('closed', () => displayWindow = null);
}

function loadImages(layer) {
  fs.readdir(settings.imageDirectories[layer], function (err, files) {
    if (err) {
      console.error('Could not read directory', layer);
    }
    controlWindow.webContents.send('loadImages', layer, files, settings.imageDirectories[layer]);
  });
}

function saveSettings() {
  fs.writeFile(settings.settingsFileName, JSON.stringify(settings), () => {console.log("Saved settings.")});
}

function setImageDirectory(layer) {
  dialog.showOpenDialog({
    properties: ['openDirectory'],
  }).then(result => {
    if (result.canceled) {
      return;
    }
    settings.imageDirectories[layer] = result.filePaths[0];
    saveSettings();
    loadImages(layer);
  });
}
