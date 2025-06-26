const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800, height: 600,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  })
  mainWindow.loadFile(path.join(__dirname, 'pages/home.html'))
}
app.whenReady().then(createWindow)

ipcMain.on('navigate-to', (_ev, pageName) => {
  mainWindow.loadFile(path.join(__dirname, 'pages', `${pageName}.html`))
})

app.on("window-all-closed", () => {
  app.quit();
});
