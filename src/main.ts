import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let cssKey: string | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 832,
    backgroundColor: '#ffffff',
    show: false, // Don't show until content is ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Show loading indicator
  mainWindow.loadFile(path.join(__dirname, 'loading.html'));

  // Load actual content
  mainWindow.loadURL('https://fast.com').catch(err => {
    console.error('Failed to load page:', err);
    // Could show error page here
  });

  mainWindow.webContents.on('did-finish-load', () => {
    // Remove previous CSS if exists
    if (cssKey) {
      mainWindow?.webContents.removeInsertedCSS(cssKey);
    }
    // Insert new CSS and store the key
    mainWindow?.webContents.insertCSS('html { filter: invert(100%) grayscale(100%) !important; }')
      .then(key => cssKey = key);
    
    mainWindow?.show();
  });

  // Register shortcuts
  globalShortcut.register('CommandOrControl+R', () => {
    mainWindow?.reload();
  });
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  // Clean up shortcuts when app is quitting
  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});