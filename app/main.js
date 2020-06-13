const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
var mainWindow = null;

const openFile = file => {
  fs.readFile(file, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }

    mainWindow.webContents.send('file-opened', file, data.toString());
  })
};

exports.getFile = () => {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['multiSelections', 'openFile'],
    buttonLabel: 'Unveil',
    filters: [
      {
        name: 'Markdown Files',
        extensions: ['md', 'markdown', 'mdown']
      },
      {
        name: 'Text Files',
        extensions: ['txt', 'text']
      }
    ]
  });

  if (!files) return;

  openFile(files[0]);
}

app.on('ready', () => {
  mainWindow = new BrowserWindow({ show: false });

  mainWindow.loadFile(`${__dirname}/index.html`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

  })
})