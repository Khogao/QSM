import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import path from 'path';
import { LocalStorage } from './services/localStorage';
import { FileImport } from './services/fileImport';
import { registerOrganizationHandlers } from './organizationHandlers';

let mainWindow: BrowserWindow | null = null;
let storage: LocalStorage;
let fileImport: FileImport;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  // In dev mode, load from vite dev server
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    console.log('🚀 Loading from Vite Dev Server: http://localhost:5173');
  } else {
    // Production mode - FIXED PATH RESOLUTION
    // Use app.getAppPath() to get the correct base path
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    console.log('📦 Loading from production build:', indexPath);
    
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('❌ Failed to load index.html:', err);
      console.log('🔍 Trying alternative paths...');
      
      // Fallback 1: Try relative to __dirname
      const fallback1 = path.join(__dirname, '../dist/index.html');
      console.log('   Fallback 1:', fallback1);
      
      mainWindow?.loadFile(fallback1).catch(err2 => {
        console.error('❌ Fallback 1 failed:', err2);
        
        // Fallback 2: Try process.resourcesPath
        const fallback2 = path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html');
        console.log('   Fallback 2:', fallback2);
        
        mainWindow?.loadFile(fallback2).catch(err3 => {
          console.error('❌ All paths failed!');
          console.error('__dirname:', __dirname);
          console.error('app.getAppPath():', app.getAppPath());
          console.error('process.resourcesPath:', process.resourcesPath);
        });
      });
    });
  }

  // Open DevTools automatically in dev mode for debugging
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page loaded successfully');
  });

  // Log any page load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Page failed to load:', errorCode, errorDescription);
  });
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: '📄 Import Files',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            if (mainWindow) {
              const result = await fileImport.importFiles();
              mainWindow.webContents.send('import-complete', result);
            }
          }
        },
        {
          label: '📁 Import Folder',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: async () => {
            if (mainWindow) {
              const result = await fileImport.importFolder();
              mainWindow.webContents.send('import-complete', result);
            }
          }
        },
        { type: 'separator' },
        {
          label: '💾 Export Database',
          accelerator: 'CmdOrCtrl+E',
          click: async () => {
            try {
              const { filePath } = await dialog.showSaveDialog({
                defaultPath: `archi-query-backup-${new Date().toISOString().split('T')[0]}.json`,
                filters: [{ name: 'JSON', extensions: ['json'] }]
              });

              if (!filePath) return;

              const fs = require('fs-extra');
              const data = {
                documents: storage.getDocuments(),
                exportedAt: new Date().toISOString(),
                version: app.getVersion()
              };

              await fs.writeJson(filePath, data, { spaces: 2 });
              
              dialog.showMessageBox({
                type: 'info',
                title: 'Export Successful',
                message: `Database exported to:\n${filePath}`,
                buttons: ['OK']
              });
            } catch (error) {
              console.error('Export error:', error);
              dialog.showErrorBox('Export Failed', error instanceof Error ? error.message : String(error));
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Database',
      submenu: [
        {
          label: '🔄 Refresh Documents',
          accelerator: 'F5',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('refresh-documents');
            }
          }
        },
        {
          label: '📊 View Statistics',
          click: () => {
            const docs = storage.getDocuments();
            const totalSize = docs.reduce((sum, doc) => sum + doc.size, 0);
            const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
            
            dialog.showMessageBox({
              type: 'info',
              title: 'Database Statistics',
              message: `Total Documents: ${docs.length}\nTotal Size: ${sizeInMB} MB`,
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        {
          label: '📂 Open Data Folder',
          click: () => {
            const { shell } = require('electron');
            const dataPath = path.join(app.getPath('appData'), 'archi-query-electron');
            shell.openPath(dataPath);
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: '📖 About Archi Query Free',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'About Archi Query Free',
              message: `Archi Query Free v${app.getVersion()}\n\nLocal RAG Document Query & Organization\n\n✓ Local storage only\n✓ Portable mode\n✓ Privacy-first\n\nUpgrade to Pro for network drive support!`,
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        {
          label: '🚀 Upgrade to Pro',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'Upgrade to Pro',
              message: 'Pro Version Features:\n\n✓ Network drive support\n✓ Real-time collaboration\n✓ Cloud sync\n✓ Advanced RAG features\n\nComing soon!',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function registerIPCHandlers() {
  // File import
  ipcMain.handle('files:import', async () => {
    try {
      return await fileImport.importFiles();
    } catch (error) {
      console.error('Import files error:', error);
      return { success: 0, failed: 0, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('files:importFolder', async () => {
    try {
      return await fileImport.importFolder();
    } catch (error) {
      console.error('Import folder error:', error);
      return { success: 0, failed: 0, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Database operations
  ipcMain.handle('db:getDocuments', async () => {
    try {
      return storage.getDocuments();
    } catch (error) {
      console.error('Get documents error:', error);
      return [];
    }
  });

  ipcMain.handle('db:deleteDocument', async (event, docId: string) => {
    try {
      storage.deleteDocument(docId);
      return { success: true };
    } catch (error) {
      console.error('Delete document error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Export
  ipcMain.handle('db:export', async () => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: `archi-query-backup-${new Date().toISOString().split('T')[0]}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (!filePath) return null;

      const fs = require('fs-extra');
      const data = {
        documents: storage.getDocuments(),
        exportedAt: new Date().toISOString(),
        version: app.getVersion()
      };

      await fs.writeJson(filePath, data, { spaces: 2 });
      return filePath;
    } catch (error) {
      console.error('Export error:', error);
      return null;
    }
  });
}

app.on('ready', () => {
  // Initialize services
  storage = new LocalStorage();
  fileImport = new FileImport(storage);
  
  // Register IPC handlers
  registerIPCHandlers();
  registerOrganizationHandlers(); // Organization features
  
  // Create menu
  createMenu();
  
  // Create window
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
