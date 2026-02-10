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
| `src/main.js` | Electron Main Process — Fenster, PTY-Management, IPC-Handler, Ollama/HF/Gemini/Screenshot-IPC |
| `src/preload.js` | Context Bridge — exponiert `forgeAPI` an den Renderer |
| `src/index.html` | Komplettes Frontend — CSS, HTML, JS in einer Datei |
| `src/ollama-service.js` | Ollama REST API Service Layer — Health-Check, Completion, Chat |
| `src/huggingface-service.js` | Hugging Face Inference API Client — OpenAI-kompatibel, `/v1/chat/completions` |
| `src/gemini-service.js` | Google Gemini API Client — OpenAI-kompatibel, `/v1beta/openai/chat/completions` |
| `package.json` | Dependencies und Scripts |
| `assets/icon.png` | App-Icon |

## Terminal Lifecycle
1. `createTab()` erzeugt ein `Terminal`-Objekt (xterm.js) + `FitAddon`
2. `forgeAPI.createTerminal()` → IPC → Main Process spawnt PTY via `node-pty`
3. PTY-Daten fließen über `terminal:data` IPC-Events zum Renderer
4. User-Input geht über `terminal:input` zum PTY
5. Resize-Events werden über `terminal:resize` synchronisiert
6. `closeTab()` killt den PTY-Prozess und disposed das Terminal

## AI Autocomplete
- Drei Provider: **Ollama** (lokal), **Hugging Face** (cloud) und **Gemini** (cloud, Google Pro-Account)
- Provider-Auswahl in der Sidebar, gespeichert in `localStorage`
- Debounced (400ms), Ghost-Text-Overlay auf `xterm-screen`, Tab=Accept, Esc=Dismiss
- Statusbar-Indikator zeigt AC-Status: Aus / Kein Provider / Bereit / ... / Vorschlag
- Completion-Ergebnisse werden um bereits getippten Prefix bereinigt

### Ollama
- `OllamaService` Singleton im Main Process (`src/ollama-service.js`)
- Kommuniziert mit Ollama REST API unter `http://127.0.0.1:11434`
- IPC-Kanäle: `ollama:health`, `ollama:status`, `ollama:setModel`, `ollama:complete`, `ollama:chat`
- Health-Check beim App-Start und alle 30s im Renderer

### Hugging Face
- `HuggingFaceService` Singleton im Main Process (`src/huggingface-service.js`)
- Endpoint: `https://router.huggingface.co/v1/chat/completions` (OpenAI-kompatibel)
- Default-Modell: `Qwen/Qwen2.5-Coder-32B-Instruct`
- Erfordert API Key (kostenloser Read-Token reicht): https://huggingface.co/settings/tokens
- IPC-Kanäle: `huggingface:health`, `huggingface:status`, `huggingface:setModel`, `huggingface:complete`, `huggingface:setApiKey`
- Health-Check beim App-Start und alle 60s im Renderer
- **Bekanntes Issue**: API Key wird nach App-Neustart nicht zuverlässig aus localStorage wiederhergestellt (Backlog)

### Gemini
- `GeminiService` Singleton im Main Process (`src/gemini-service.js`)
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` (OpenAI-kompatibel)
- Default-Modell: `gemini-2.0-flash`
- Erfordert API Key von https://aistudio.google.com/apikey
- IPC-Kanäle: `gemini:health`, `gemini:status`, `gemini:setModel`, `gemini:complete`, `gemini:setApiKey`
- Health-Check beim App-Start und alle 60s im Renderer

## Screenshot
- Capture via `desktopCapturer.getSources()` (Fenster + Screens)
- Picker-Overlay mit Thumbnails, Klick auf Source → Full-Res Capture
- Screenshots gespeichert unter `~/forge-screenshots/`
- Hotkey: Ctrl+Shift+S, IPC: `screenshot:getSources`, `screenshot:capture`

## Run-Befehle
```bash
# Dependencies installieren
npm install

# App starten
npm start

# Dev-Modus (mit DevTools)
npm run dev
```
