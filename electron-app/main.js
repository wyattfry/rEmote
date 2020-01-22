const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
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
    // Will instantiate control window if not already.
    createControlWindow(() => {
      if (settingsFileExisted) {
        console.log("Created control window. Loading images...")
        // If any image directories saved in loaded settings file, load
        // those images as buttons in control window.
        Object.keys(settings.imageDirectories).forEach(layer => {
          if (settings.imageDirectories[layer] != null) {
            loadImages(layer);
          }
        });
      } else {
        console.log("Created new settings file.")
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
          return;
        }
        settings = JSON.parse(data);
        console.log("Loaded settings from file.", settings);
        console.log("Loading images into control window...")
        Object.keys(settings.imageDirectories).forEach(layer => {
          if (settings.imageDirectories[layer] != null) {
            loadImages(layer);
          }
        });
        callback(true);
      });
    } else {
      // create settings file if it does not already exist
      fs.writeFile(settings.settingsFileName, JSON.stringify(settings), () => {callback(false)});
    }
  });
}

const windowMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Import Settings...',
        click: importSettings,
      }
    ],
  }
];

function importSettings() {
  // open file choose for 'settings.json'
  dialog.showOpenDialog()
    .then(result => {
    if (result.canceled) {
      return;
    }
    if (path.basename(result.filePaths[0]) != settings.settingsFileName) {
      console.warn('Selected file to import was not named "settings.json", maybe not valid.');
    }
    const sourceSettingsFile = result.filePaths[0];
    const destinationSettingsFile = path.join(__dirname, settings.settingsFileName);
    fs.copyFile(sourceSettingsFile, destinationSettingsFile, (err) => {
      if (err) {
        console.error('Could not import settings file.', err);
        return;
      }
      console.log(`Settings file '${sourceSettingsFile}' was copied to '${destinationSettingsFile}'.`)
      loadOrCreateSettings(()=>console.log('loaded new settings file'));
    });
});
  // once selected load new settings file.
}
const controlWindowMenu = Menu.buildFromTemplate(windowMenuTemplate)
Menu.setApplicationMenu(controlWindowMenu);

// Control Window
let controlWindow;

async function createControlWindow(callback) {
  if (controlWindow != undefined) {
    callback();
    return
  }
  controlWindow = new BrowserWindow({
    width: 800,
    height: 600,
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
  if (displayWindow != undefined) {
    callback();
    return
  }
  displayWindow = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: {
      nodeIntegration: true,
    }
  });
  displayWindow.setMenuBarVisibility(false);
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
