var app = require('app');
var BrowserWindow = require('browser-window');

require('crash-reporter').start();

var mainWindow = null;
process.on('error', function(err) {
  console.log(err);
});
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 800, height: 800});

  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // mainWindow.openDevTools();
  mainWindow.webContents.on('did-finish-load', function() {
    var dialog = require('dialog');
     mainWindow.webContents.send('open', dialog.showOpenDialog({ properties: [ 'openDirectory' ]}));
   });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
