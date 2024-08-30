///////////////////
///// IMPORTS /////
///////////////////

const { app, BrowserWindow } = require('electron');

/////////////////////////////
///// BASE ELECTRON APP /////
/////////////////////////////

app.whenReady().then(function()
{
  createWindow();

  app.on('activate', function()
  {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  }.bind(this));
}.bind(this));

app.on('window-all-closed', function()
{
  if (process.platform !== 'darwin') app.quit()
}.bind(this));

///////////////////////
///// APP METHODS /////
///////////////////////

const createWindow = function()
{
  const win = new BrowserWindow
  ({
    webPreferences:
    {
      devTools: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      webSecurity: false, // TODO: re-enable this
      webgl: true,
      experimentalFeatures: false,
      backgroundThrottling: false,
    },
    width: 1920,
    height: 1080,
    autoHideMenuBar: true,
    frame: true,
    show: false
  });

  win.loadFile('./_build/index.html');

  // https://www.electronjs.org/docs/latest/api/browser-window#using-the-ready-to-show-event
  win.once('ready-to-show', function()
  {
    win.show()
  }.bind(this));

}.bind(this);
