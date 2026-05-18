const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

// Mantener referencia global para que no sea eliminada por el GC
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1280,
    height: 800,
    minWidth:  900,
    minHeight: 600,
    title: 'Taller Elvira',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    // Barra de título personalizada (se ve bien en Windows y Mac)
    backgroundColor: '#FAF7F2',
    show: false, // mostrar cuando esté listo
  });

  // Cargar la app
  mainWindow.loadFile(path.join(__dirname, '..', 'pwa', 'index.html'));

  // Mostrar ventana cuando esté lista (evita flash blanco)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Abrir links externos en el navegador del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http') || url.startsWith('https') ||
        url.startsWith('mailto') || url.startsWith('sms') ||
        url.startsWith('https://wa.me')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// Menú de la aplicación
function buildMenu() {
  const template = [
    {
      label: 'Taller Elvira',
      submenu: [
        { label: 'Acerca de Taller Elvira', role: 'about' },
        { type: 'separator' },
        { label: 'Salir', accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Deshacer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Rehacer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar',   accelerator: 'CmdOrCtrl+X', role: 'cut'   },
        { label: 'Copiar',   accelerator: 'CmdOrCtrl+C', role: 'copy'  },
        { label: 'Pegar',    accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Seleccionar todo', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { label: 'Recargar',       accelerator: 'CmdOrCtrl+R',      role: 'reload'          },
        { label: 'Pantalla completa', accelerator: 'F11',           role: 'togglefullscreen' },
        { label: 'Acercar',        accelerator: 'CmdOrCtrl+=',      role: 'zoomIn'           },
        { label: 'Alejar',         accelerator: 'CmdOrCtrl+-',      role: 'zoomOut'          },
        { label: 'Zoom normal',    accelerator: 'CmdOrCtrl+0',      role: 'resetZoom'        },
      ]
    },
    {
      label: 'Imprimir',
      submenu: [
        {
          label: 'Imprimir ticket',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow?.webContents.print({
              silent: false,
              printBackground: true,
              color: true,
            });
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  createWindow();
  buildMenu();

  // macOS: volver a abrir al clic en el dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Cerrar app en Windows/Linux al cerrar todas las ventanas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
