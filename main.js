const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: __dirname + '/icona.ico',
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('DailyLife13Rivista-Modificata2.html')
}

app.whenReady().then(createWindow)