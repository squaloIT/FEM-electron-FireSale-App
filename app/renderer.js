const marked = require('marked');
const { remote, ipcRenderer, shell } = require('electron')
const path = require('path');

const currentWindow = remote.getCurrentWindow();

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

let originalContent = '';
let filePath = null;
const mainFile = remote.require('./main');
const acceptableFormats = ['text/plain', 'text/html', 'text/markdown'];

const updateUserInterface = isEdited => {
  let title = 'Fire Sale';

  if (filePath)
    title = `${path.basename(filePath)} - ${title}`;

  if (isEdited) {
    title += " (Edited)"
  }

  currentWindow.setTitle(title);

  if (filePath) currentWindow.setRepresentedFilename(filePath)
  currentWindow.setDocumentEdited(isEdited)
};

const renderMarkdownToHtml = markdown => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

const configureDisableForRevertButton = (isDisabled) => {
  revertButton.disabled = isDisabled;
};

const configureDisableForSaveButton = (isDisabled) => {
  saveMarkdownButton.disabled = isDisabled;
};

const configureDisableForHTMLButton = (isDisabled) => {
  saveHtmlButton.disabled = isDisabled;
};

const isHtmlFile = (file) => {
  return file.indexOf('.html') !== -1
};

const isRightFormatOfFile = (file, formats) => {
  return formats.includes(file.type)
}

markdownView.addEventListener('keyup', event => {
  const currentContent = event.target.value;

  renderMarkdownToHtml(currentContent);
  updateUserInterface(currentContent != originalContent);
  configureDisableForRevertButton(currentContent == originalContent);
  configureDisableForSaveButton(currentContent == originalContent);
  configureDisableForHTMLButton(currentContent == originalContent)

  if (filePath && isHtmlFile(filePath)) {
    configureDisableForHTMLButton(currentContent == originalContent)
  }
});

const saveHTML = () => {
  const fileName = mainFile.saveHTML(htmlView.innerHTML);

  if (fileName) {
    filePath = fileName;
    originalContent = markdownView.value;
    configureDisableForHTMLButton(true)
  }
};

saveHtmlButton.addEventListener('click', saveHTML);

showFileButton.addEventListener('click', () => {
  if (!filePath) {
    alert("Niste izabrali fajl")
    return;
  }

  shell.showItemInFolder(filePath)
})

openFileButton.addEventListener('click', () => {
  mainFile.getFile();
})

openInDefaultButton.addEventListener('click', () => {
  shell.openItem(filePath)
})

const saveContent = () => {
  const fileName = mainFile.saveFile(filePath, markdownView.value);
  if (fileName) {
    filePath = fileName;
    originalContent = markdownView.value;
    configureDisableForRevertButton(true)
    configureDisableForSaveButton(true)
  }
};

saveMarkdownButton.addEventListener('click', saveContent);

ipcRenderer.on('save-content', saveContent);
ipcRenderer.on('save-html-content', saveHTML);

ipcRenderer.on('file-opened', (evt, file, content) => {
  filePath = file;
  // if (!isHtmlFile(filePath)) {
  //   originalContent = content;
  //   markdownView.value = content;
  //   renderMarkdownToHtml(content);
  // }
  originalContent = content;
  markdownView.value = content;
  renderMarkdownToHtml(content);
  updateUserInterface(false); //isEdited je uvek true kada se otvori fajl

  showFileButton.disabled = !filePath;
  openInDefaultButton.disabled = !filePath;
});

document.addEventListener('drop', evt => evt.preventDefault())
document.addEventListener('dragover', evt => evt.preventDefault())
document.addEventListener('dragstart', evt => evt.preventDefault())
document.addEventListener('dragleave', evt => evt.preventDefault())

markdownView.addEventListener('dragover', evt => {
  const draggedFiles = evt.dataTransfer.items[0];

  if (isRightFormatOfFile(draggedFiles.length > 0 ? draggedFiles[0] : draggedFiles, acceptableFormats)) {
    markdownView.classList.add('drag-over')
  } else {
    markdownView.classList.add('drag-error')
  }
})

markdownView.addEventListener('dragleave', evt => {
  markdownView.classList.remove('drag-over')
  markdownView.classList.remove('drag-error')
})

markdownView.addEventListener('drop', evt => {
  const droppedFiles = evt.dataTransfer.files[0];
  markdownView.classList.remove('drag-over')
  markdownView.classList.remove('drag-error')

  if (isRightFormatOfFile(droppedFiles.length > 0 ? droppedFiles[0] : droppedFiles, acceptableFormats)) {
    mainFile.openFile(droppedFiles.path)
  }
})
