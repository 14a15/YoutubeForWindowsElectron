const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

app.setPath("userData", path.join(__dirname, "userdata"));

let mainWindow;
let splash;

function createSplash() {
  splash = new BrowserWindow({
    width: 300,
    height: 300,
    frame: false,
    resizable: false,
    backgroundColor: "#000000",
    alwaysOnTop: true,
    center: true
  });

  splash.loadFile(path.join(__dirname, "splash.html"));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    backgroundColor: "#000000",
    icon: path.join(__dirname, "icon.ico"),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      webviewTag: true,
      sandbox: false
    }
  });

  mainWindow.loadFile("index.html");

  mainWindow.once("ready-to-show", () => {
    setTimeout(() => {
      if (splash && !splash.isDestroyed()) splash.close();
      mainWindow.show();
    }, 800);
  });

  // enviar estado da janela
  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window-state", "maximized");
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window-state", "normal");
  });
}

// IPC dos botões
ipcMain.on("window-minimize", () => mainWindow.minimize());

ipcMain.on("window-maximize", () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});

ipcMain.on("window-close", () => mainWindow.close());

app.whenReady().then(() => {
  createSplash();
  createMainWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
