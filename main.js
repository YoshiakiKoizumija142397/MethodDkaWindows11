const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 950,
    height: 750,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  // メニューバーを非表示
  Menu.setApplicationMenu(null);

  // メイン画面（index.html）をロード
  win.loadFile(path.join(__dirname, 'index.html'));

  // target="_blank" や window.open の安全なハンドリング
  win.webContents.setWindowOpenHandler(({ url }) => {
    // 外部Webサイト（http/https）はOS既定のブラウザで開く
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }

    // ローカルファイル（help.html, privacy.html 等）は安全にサブウィンドウで開く
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol === 'file:') {
        const subWin = new BrowserWindow({
          width: 850,
          height: 650,
          parent: win,
          icon: path.join(__dirname, 'icon.ico'),
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
          }
        });
        subWin.setMenu(null);
        subWin.loadURL(url);

        // サブウィンドウ内の外部リンクも規定ブラウザで開く
        subWin.webContents.setWindowOpenHandler(({ url: subUrl }) => {
          if (subUrl.startsWith('http://') || subUrl.startsWith('https://')) {
            shell.openExternal(subUrl);
          }
          return { action: 'deny' };
        });

        return { action: 'deny' };
      }
    } catch (e) {
      console.error('Window open error:', e);
    }

    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});