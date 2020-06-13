const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
var mainWindow = null;

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

  console.log(files[0].toString());
  fs.readFile(files[0], (err, data) => {
    if (err) {
      console.log(err)
      return;
    }

    console.log(data.toString());
  })
}

app.on('ready', () => {
  mainWindow = new BrowserWindow({ show: false });

  mainWindow.loadFile(`${__dirname}/index.html`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

  })
})