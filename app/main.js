const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

var mainWindow = null;

const openFile = (exports.openFile = file => {
  console.log(file)
  fs.readFile(file, (err, data) => {
    console.log(data.toString())
    if (err) {
      console.log(err)
      return;
    }

    app.addRecentDocument(file);
    mainWindow.webContents.send('file-opened', file, data.toString());
  })
});

exports.saveHTML = (htmlContent) => {
  file = dialog.showSaveDialog(mainWindow, {
    title: 'Save your fu...ng HTML file!',
    defaultPath: app.getPath('desktop'),
    filters: [
      {
        name: 'HTML files',
        extensions: ['html']
      }
    ]
  });

  if (!file) return;

  fs.writeFile(file, htmlContent, err => {
    if (err) {
      console.log(err);
      return;
    }
  })

  openFile(file);
  return file;
};

exports.saveFile = (file, content) => {
  if (!file) {
    file = dialog.showSaveDialog(mainWindow, {
      title: 'Save your fu...ng file!',
      defaultPath: app.getPath('desktop'),
      filters: [
        {
          name: 'Text files',
          extensions: ['txt']
        },
        {
          name: 'Markdown files',
          extensions: ['md', 'mdown', 'markdown']
        }
      ]
    });
  }

  if (!file) return;

  fs.writeFile(file, content, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
  })
  openFile(file);
  return file;
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
      },
      {
        name: 'HTML Files',
        extensions: ['html', 'htm']
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
});