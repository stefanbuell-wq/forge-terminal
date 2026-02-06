# ⚡ Forge Terminal

Ein Warp-inspirierter Terminal-Emulator mit Claude Code Auto-Accept und AI-Provider-Integration.

![Forge Terminal](https://img.shields.io/badge/version-0.1.0-cyan)
![Electron](https://img.shields.io/badge/electron-33.x-blue)
![Platform](https://img.shields.io/badge/platform-linux%20%7C%20mac%20%7C%20win-green)

## Features

- **Warp-like UI** — Modernes, dunkles Terminal-Interface mit Tabs, Sidebar und Status Bar
- **Auto-Accept für Claude Code** — 3 Stufen: Safe (Read-only), Moderat (Read+Write), YOLO (alles)
- **Multi-Tab** — Mehrere Terminal-Sessions parallel (Ctrl+T / Ctrl+W)
- **AI Provider Switching** — Vorbereitet für Claude, OpenAI, Ollama (erweiterbar)
- **xterm.js** — Vollwertiger Terminal-Emulator mit 256-Farben, Links, Scrollback

## Voraussetzungen

- **Node.js 18+** — `node --version`
- **npm** — wird mit Node mitgeliefert
- **Claude Code** — `curl -fsSL https://claude.ai/install.sh | bash`
- **Build Tools** (für node-pty):
  ```bash
  # Ubuntu/Debian/Pop!_OS
  sudo apt install -y build-essential python3
  
  # Fedora
  sudo dnf groupinstall "Development Tools"
  ```

## Installation

```bash
# Repository klonen oder Ordner kopieren
cd forge-terminal

# Dependencies installieren
npm install

# Starten
npm start

# Dev-Mode (mit DevTools)
npm run dev
```

### Falls `node-pty` Probleme macht:

```bash
# Rebuild für aktuelle Electron-Version
npx electron-rebuild
```

## Tastenkürzel

| Kürzel | Aktion |
|---|---|
| `Ctrl+T` | Neuer Tab |
| `Ctrl+W` | Tab schließen |
| `Ctrl+L` | Terminal leeren |

## Auto-Accept Stufen

| Stufe | Verhalten |
|---|---|
| **Safe** | Nur Lese-Operationen automatisch bestätigen |
| **Moderat** | Lese- und Schreib-Operationen bestätigen |
| **YOLO** | Alles automatisch bestätigen (`--dangerously-skip-permissions`) |

> ⚠️ **YOLO-Modus** überspringt ALLE Sicherheitsabfragen. Nur in eigenen Projekten verwenden!

## Architektur

```
forge-terminal/
├── package.json          # Dependencies & Scripts
├── src/
│   ├── main.js           # Electron Main Process + PTY Management
│   ├── preload.js        # Secure IPC Bridge
│   └── index.html        # UI (xterm.js + Sidebar + Tabs)
└── README.md
```

## Erweiterung: Neue AI Provider hinzufügen

1. Provider in der Sidebar-Liste in `index.html` eintragen
2. Launch-Logik in `main.js` unter `ipcMain.handle('claude:launch')` erweitern
3. Provider-spezifische ENV-Variablen im PTY-Spawn setzen

## Nächste Schritte (Roadmap)

- [ ] Intelligentes Auto-Accept (Regex-basiert: nur bestimmte Befehle akzeptieren)
- [ ] Ollama-Integration für lokale LLMs
- [ ] Command Palette (Ctrl+P) wie VS Code
- [ ] Session Persistence (Tabs merken nach Restart)
- [ ] Split Panes (horizontal/vertikal)
- [ ] Theming Engine (eigene Farbschemas)
- [ ] Claude Code Output-Parser (strukturierte Darstellung)

## Tech Stack

- **Electron** — Cross-Platform Desktop Framework
- **xterm.js** — Terminal-Emulator im Browser
- **node-pty** — Pseudo-Terminal Binding für Node.js

## Lizenz

MIT
