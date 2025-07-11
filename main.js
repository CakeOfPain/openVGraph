const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),

      contextIsolation: true,
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile(path.join(__dirname, "pages/getting-started.html"));
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

ipcMain.on("navigate-to", (_ev, pageName) => {
  mainWindow.loadFile(path.join(__dirname, "pages", `${pageName}.html`));
});

app.on("window-all-closed", () => {
  app.quit();
});
