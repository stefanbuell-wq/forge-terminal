const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');

const ollama = require('./ollama-service');
const huggingface = require('./huggingface-service');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin' ? true : false,
    backgroundColor: '#0a0e14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools in dev mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// ── PTY Management ──────────────────────────────────────────────
const pty = require('node-pty');
const shells = new Map();
let shellCounter = 0;

function getDefaultShell() {
  if (process.platform === 'win32') return 'powershell.exe';
  return process.env.SHELL || '/bin/bash';
}

ipcMain.handle('terminal:create', (event, options = {}) => {
  const id = ++shellCounter;
  const shell = getDefaultShell();
  const cwd = options.cwd || os.homedir();

  const env = { ...process.env };

  // Auto-accept mode for Claude Code
  if (options.autoAccept) {
    env.CLAUDE_CODE_AUTO_ACCEPT = '1';
  }

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: options.cols || 120,
    rows: options.rows || 30,
    cwd: cwd,
    env: env,
  });

  shells.set(id, {
    pty: ptyProcess,
    autoAccept: options.autoAccept || false,
    aiProvider: options.aiProvider || 'claude',
  });

  ptyProcess.onData((data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('terminal:data', { id, data });
    }
  });

  ptyProcess.onExit(({ exitCode }) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('terminal:exit', { id, exitCode });
    }
    shells.delete(id);
  });

  return { id, shell, cwd };
});

ipcMain.on('terminal:input', (event, { id, data }) => {
  const shell = shells.get(id);
  if (shell) {
    shell.pty.write(data);
  }
});

ipcMain.on('terminal:resize', (event, { id, cols, rows }) => {
  const shell = shells.get(id);
  if (shell) {
    shell.pty.resize(cols, rows);
  }
});

ipcMain.on('terminal:kill', (event, { id }) => {
  const shell = shells.get(id);
  if (shell) {
    shell.pty.kill();
    shells.delete(id);
  }
});

// Launch Claude Code in a terminal with auto-accept
ipcMain.handle('claude:launch', (event, { id, args = [] }) => {
  const shell = shells.get(id);
  if (shell) {
    const cmd = shell.autoAccept
      ? `claude --dangerously-skip-permissions ${args.join(' ')}\r`
      : `claude ${args.join(' ')}\r`;
    shell.pty.write(cmd);
  }
});

// ── Folder Dialog ────────────────────────────────────────────────
ipcMain.handle('dialog:openFolder', async (event, defaultPath) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    defaultPath: defaultPath || os.homedir(),
    properties: ['openDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// ── Ollama IPC ───────────────────────────────────────────────────
ipcMain.handle('ollama:health', () => ollama.checkHealth());
ipcMain.handle('ollama:status', () => ollama.getStatus());
ipcMain.handle('ollama:setModel', (event, model) => ollama.setModel(model));
ipcMain.handle('ollama:complete', (event, { prompt, options }) => ollama.complete(prompt, options));
ipcMain.handle('ollama:chat', (event, { messages, options }) => ollama.chat(messages, options));

// ── Hugging Face IPC ──────────────────────────────────────────
ipcMain.handle('huggingface:health', () => huggingface.checkHealth());
ipcMain.handle('huggingface:status', () => huggingface.getStatus());
ipcMain.handle('huggingface:setModel', (event, model) => huggingface.setModel(model));
ipcMain.handle('huggingface:complete', (event, { prompt, options }) => huggingface.complete(prompt, options));
ipcMain.handle('huggingface:setApiKey', (event, key) => {
  huggingface.setApiKey(key);
  return huggingface.checkHealth();
});

// ── Window controls (for frameless on Linux) ────────────────────
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window:close', () => mainWindow?.close());

// ── App Lifecycle ───────────────────────────────────────────────
app.whenReady().then(async () => {
  createWindow();
  // Check Ollama availability on startup
  const ollamaHealth = await ollama.checkHealth();
  if (ollamaHealth.available) {
    console.log(`Ollama connected: ${ollamaHealth.models.length} model(s) available`);
  } else {
    console.log('Ollama not available');
  }

  // Check Hugging Face availability on startup
  const hfHealth = await huggingface.checkHealth();
  if (hfHealth.available) {
    console.log(`Hugging Face connected: model ${hfHealth.model}`);
  } else {
    console.log('Hugging Face not available');
  }
});

app.on('window-all-closed', () => {
  // Kill all shells
  for (const [id, shell] of shells) {
    shell.pty.kill();
  }
  shells.clear();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
