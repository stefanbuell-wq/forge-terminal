# Forge Terminal

## Projekt-Übersicht
Forge Terminal ist ein Electron-basierter Terminal-Emulator mit Warp-inspirierter UI und integrierter Claude Code Unterstützung. Er bietet Multi-Tab-Terminals, Auto-Accept-Modi für AI-Coding-Assistenten und eine moderne Dark-Theme-Oberfläche.

## Architektur
- **Electron** (Main + Renderer Process mit Context Isolation)
- **node-pty** für PTY-Spawning im Main Process
- **xterm.js** für Terminal-Rendering im Renderer
- IPC-Kommunikation zwischen Main und Renderer über `ipcMain`/`ipcRenderer`
- Preload-Script exponiert `forgeAPI` via `contextBridge`

## Konventionen
- Sprache: UI-Texte auf Deutsch, Code/Kommentare auf Englisch
- CSS: Custom Properties in `:root`, BEM-ähnliche Klassennamen
- Kein Build-Step — alle Assets werden direkt aus `node_modules` geladen
- Single-File Frontend: `index.html` enthält CSS, HTML und JS
- State-Management: Einfaches `state`-Objekt im Renderer

## File Map
| Datei | Beschreibung |
|-------|-------------|
| `src/main.js` | Electron Main Process — Fenster, PTY-Management, IPC-Handler, Ollama-IPC |
| `src/preload.js` | Context Bridge — exponiert `forgeAPI` an den Renderer |
| `src/index.html` | Komplettes Frontend — CSS, HTML, JS in einer Datei |
| `src/ollama-service.js` | Ollama REST API Service Layer — Health-Check, Completion, Chat |
| `package.json` | Dependencies und Scripts |
| `assets/icon.png` | App-Icon |

## Terminal Lifecycle
1. `createTab()` erzeugt ein `Terminal`-Objekt (xterm.js) + `FitAddon`
2. `forgeAPI.createTerminal()` → IPC → Main Process spawnt PTY via `node-pty`
3. PTY-Daten fließen über `terminal:data` IPC-Events zum Renderer
4. User-Input geht über `terminal:input` zum PTY
5. Resize-Events werden über `terminal:resize` synchronisiert
6. `closeTab()` killt den PTY-Prozess und disposed das Terminal

## Ollama Integration
- `OllamaService` ist ein Singleton im Main Process (`src/ollama-service.js`)
- Kommuniziert mit Ollama REST API unter `http://127.0.0.1:11434`
- IPC-Kanäle: `ollama:health`, `ollama:status`, `ollama:setModel`, `ollama:complete`, `ollama:chat`
- Renderer greift über `forgeAPI.ollamaComplete()` / `forgeAPI.ollamaChat()` zu
- Health-Check beim App-Start und alle 30s im Renderer
- Autocomplete: Debounced (400ms), Ghost-Text-Overlay über dem Terminal, Tab=Accept, Esc=Dismiss

## Run-Befehle
```bash
# Dependencies installieren
npm install

# App starten
npm start

# Dev-Modus (mit DevTools)
npm run dev
```
