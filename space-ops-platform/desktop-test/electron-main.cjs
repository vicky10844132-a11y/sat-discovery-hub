const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

function createWindow(){
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#080a0e',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: false,
      webSecurity: true
    }
  });
  win.webContents.setWindowOpenHandler(({url}) => {
    if(/^https?:/i.test(url)) shell.openExternal(url);
    return {action:'deny'};
  });
  win.webContents.on('before-input-event', (event, input) => {
    const blocked = input.key === 'F12' ||
      ((input.control || input.meta) && input.shift && ['I','J','C'].includes(String(input.key).toUpperCase())) ||
      ((input.control || input.meta) && String(input.key).toUpperCase() === 'U');
    if(blocked) event.preventDefault();
  });
  win.loadFile(path.join(__dirname, 'web', 'workspace.html'));
  win.once('ready-to-show', () => { win.show(); win.maximize(); });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if(BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if(process.platform !== 'darwin') app.quit(); });
