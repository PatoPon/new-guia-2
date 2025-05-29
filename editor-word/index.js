const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,  // para simplificar, depois ajusta se quiser
    }
  });

  win.loadFile('index.html');
  win.webContents.openDevTools()

}


app.whenReady().then(createWindow);