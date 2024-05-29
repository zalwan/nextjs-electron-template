// main.mjs
import { app, BrowserWindow } from "electron";
import serve from "electron-serve";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appServe = app.isPackaged
  ? serve({
      directory: path.join(__dirname, "out"),
    })
  : null;

const createWindows = () => {
  const preloadPath = path.join(__dirname, "preload.js");
  console.log("Preload script path:", preloadPath); // Tambahkan log ini

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: preloadPath,
      // inspect element disable on production
      devTools: !app.isPackaged,
    },
  });

  if (app.isPackaged) {
    appServe(mainWindow).then(() => {
      mainWindow.loadURL("app://-");
    });
  } else {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.on("did-fail-load", (e, code, desc) => {
      mainWindow.webContents.reloadIgnoringCache();
    });
  }
};

app.on("ready", () => {
  createWindows();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
