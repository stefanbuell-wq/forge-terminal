const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('forgeAPI', {
  // Terminal
  createTerminal: (options) => ipcRenderer.invoke('terminal:create', options),
  sendInput: (id, data) => ipcRenderer.send('terminal:input', { id, data }),
  resizeTerminal: (id, cols, rows) => ipcRenderer.send('terminal:resize', { id, cols, rows }),
  killTerminal: (id) => ipcRenderer.send('terminal:kill', { id }),
  onTerminalData: (callback) => {
    ipcRenderer.on('terminal:data', (event, payload) => callback(payload));
  },
  onTerminalExit: (callback) => {
    ipcRenderer.on('terminal:exit', (event, payload) => callback(payload));
  },

  // Claude Code
  launchClaude: (id, args) => ipcRenderer.invoke('claude:launch', { id, args }),

  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
});
