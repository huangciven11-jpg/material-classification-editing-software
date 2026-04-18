const electron = require('electron')
const { app, BrowserWindow } = electron
const screenshot = require('screenshot-desktop')
const path = require('node:path')
const os = require('node:os')

const outputPath = path.join(os.homedir(), 'Desktop', '素材分类剪辑软件', 'exports', 'window-capture-smoke.png')

function createWindow() {
  const win = new BrowserWindow({ width: 1200, height: 800, show: true })
  win.loadURL('data:text/html,<h1>capture smoke</h1>')
  setTimeout(async () => {
    try {
      await screenshot({ filename: outputPath })
      console.log(outputPath)
    } catch (error) {
      console.error(String(error))
      process.exitCode = 1
    } finally {
      app.quit()
    }
  }, 1500)
}

app.whenReady().then(createWindow)
