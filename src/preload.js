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

  // Dialogs
  openFolderDialog: (defaultPath) => ipcRenderer.invoke('dialog:openFolder', defaultPath),

  // Ollama AI
  ollamaHealth: () => ipcRenderer.invoke('ollama:health'),
  ollamaStatus: () => ipcRenderer.invoke('ollama:status'),
  ollamaSetModel: (model) => ipcRenderer.invoke('ollama:setModel', model),
  ollamaComplete: (prompt, options) => ipcRenderer.invoke('ollama:complete', { prompt, options }),
  ollamaChat: (messages, options) => ipcRenderer.invoke('ollama:chat', { messages, options }),

  // Hugging Face AI
  hfHealth: () => ipcRenderer.invoke('huggingface:health'),
  hfStatus: () => ipcRenderer.invoke('huggingface:status'),
  hfSetModel: (model) => ipcRenderer.invoke('huggingface:setModel', model),
  hfComplete: (prompt, options) => ipcRenderer.invoke('huggingface:complete', { prompt, options }),
  hfSetApiKey: (key) => ipcRenderer.invoke('huggingface:setApiKey', key),

  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
});
