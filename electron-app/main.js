const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');

// dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }).then(console.log)

app.on('ready', function () {
  createMainWindow();
  createDisplayWindow();
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
    createMainWindow();
  }
})

// Control Window
let controlWindow;
async function createMainWindow() {
  controlWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });
  controlWindow.webContents.openDevTools();
  await controlWindow.loadFile('controlWindow.html');
  // page has loaded, ipcRenderer is ready to receive events
  const layerNames = ["backgrounds", "characters", "costumes", "emotions"];
  layerNames.forEach(l => loadImages(controlWindow, l));
  controlWindow.on('closed', () => controlWindow = null);
}

// Listen for `showImage` event from mainWindow, emit a new one to the displayWindow
ipcMain.on('showImage', function (e, layer, imagePath) {
  displayWindow.webContents.send('showImage', layer, imagePath);
});

// Display Window
let displayWindow;
function createDisplayWindow() {
  displayWindow = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: {
      nodeIntegration: true,
    }
  });
  displayWindow.webContents.openDevTools();
  displayWindow.loadFile('displayWindow.html');
  displayWindow.on('closed', () => displayWindow = null);
}

function loadImages(window, layer) {
  fs.readdir(layer, function (err, files) {
    if (err) {
      console.error('Could not read directory', layer);
    }
    controlWindow.webContents.send('loadImages', layer, files);
  });
}
