const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

async function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.webContents.openDevTools();
  await mainWindow.loadFile('index.html');
  // page has loaded
  const layerNames = ["backgrounds", "characters", "costumes", "emotions"];
  layerNames.forEach(l => loadImages(mainWindow, l));
  mainWindow.on('closed', () => mainWindow = null);
}

function loadImages(window, layer) {
  fs.readdir(layer, function (err, files) {
    if (err) {
      console.error('Could not read directory');
    }
    mainWindow.webContents.send('loadImages', layer, files);
  });
}

let displayWindow;
function createDisplayWindow() {
  // Create the browser window.
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

// dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }).then(console.log)

// Emitted when the window is closed.
// mainWindow.on('closed', () => {
//   // Dereference the window object, usually you would store windows
//   // in an array if your app supports multi windows, this is the time
//   // when you should delete the corresponding element.
//   mainWindow = null
// })

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createMainWindow();
  createDisplayWindow();
})

// Quit when all windows are closed.
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
  if (mainWindow === null) {
    createMainWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Listen for `showImage` event from mainWindow, emit a new one to the displayWindow
ipcMain.on('showImage', function (e, layer, imagePath) {
  displayWindow.webContents.send('showImage', layer, imagePath);
});
