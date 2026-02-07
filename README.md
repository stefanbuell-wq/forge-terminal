# Forge Terminal

Ein Warp-inspirierter Terminal-Emulator mit Claude Code Auto-Accept und KI-Autocomplete.

![Forge Terminal](https://img.shields.io/badge/version-2.0.0-cyan)
![Electron](https://img.shields.io/badge/electron-33.x-blue)
![Platform](https://img.shields.io/badge/platform-linux%20%7C%20mac%20%7C%20win-green)

## Features

- **Warp-like UI** — Modernes, dunkles Terminal-Interface mit Tabs, Sidebar und Status Bar
- **Auto-Accept fuer Claude Code** — 3 Stufen: Safe (Read-only), Moderat (Read+Write), YOLO (alles)
- **Multi-Tab** — Mehrere Terminal-Sessions parallel (Ctrl+T / Ctrl+W)
- **KI Autocomplete** — Ghost-Text-Vorschlaege direkt im Terminal (Tab = annehmen, Esc = verwerfen)
  - **Hugging Face** — Qwen2.5-Coder-32B-Instruct via kostenlosem API-Key
  - **Ollama** — Lokale Modelle (z.B. CodeLlama)
- **AI Provider Switching** — Vorbereitet fuer Claude, OpenAI, Ollama
- **xterm.js** — Vollwertiger Terminal-Emulator mit 256-Farben, Links, Scrollback

## Voraussetzungen

- **Node.js 18+**
- **npm**

## Installation

```bash
git clone https://github.com/stefanbuell-wq/forge-terminal.git
cd forge-terminal
npm install
```

## Starten

```bash
# Normal
npm start

# Dev-Modus (mit DevTools)
npm run dev
```

## Build

```bash
# Windows (NSIS Installer + Portable)
npm run build:win

# Linux (AppImage)
npm run build
```

**Hinweis:** Fuer den Windows-Build werden die Visual Studio Build Tools 2022 mit "Desktopentwicklung mit C++" benoetigt (wegen node-pty).

## KI Autocomplete einrichten

### Hugging Face (empfohlen)

1. Kostenlosen API-Key erstellen: https://huggingface.co/settings/tokens (Read-Token reicht)
2. In der Sidebar unter "KI Autocomplete" den Key eingeben und OK klicken
3. Status sollte auf "Online" wechseln
4. Autocomplete-Toggle aktivieren

### Ollama (lokal)

1. [Ollama](https://ollama.ai) installieren
2. Ein Code-Modell laden: `ollama pull codellama:7b`
3. In der Sidebar "Ollama (Lokal)" als Provider waehlen

## Tastenkuerzel

| Kuerzel | Aktion |
|---------|--------|
| `Ctrl+T` | Neuer Tab |
| `Ctrl+W` | Tab schliessen |
| `Ctrl+L` | Terminal leeren |
| `Ctrl+Plus` | Schrift vergroessern |
| `Ctrl+Minus` | Schrift verkleinern |
| `Tab` | Autocomplete annehmen |
| `Esc` | Autocomplete verwerfen |

## Auto-Accept Stufen

| Stufe | Verhalten |
|-------|-----------|
| **Safe** | Nur Lese-Operationen automatisch bestaetigen |
| **Moderat** | Lese- und Schreib-Operationen bestaetigen |
| **YOLO** | Alles automatisch bestaetigen (`--dangerously-skip-permissions`) |

> **YOLO-Modus** ueberspringt ALLE Sicherheitsabfragen. Nur in eigenen Projekten verwenden!

## Architektur

```
forge-terminal/
├── package.json              # Dependencies & Scripts
├── src/
│   ├── main.js               # Electron Main Process, PTY-Management, IPC
│   ├── preload.js            # Secure IPC Bridge (forgeAPI)
│   ├── index.html            # Frontend (CSS + HTML + JS)
│   ├── ollama-service.js     # Ollama REST API Client
│   └── huggingface-service.js # HF Inference API Client (OpenAI-kompatibel)
└── assets/
    └── icon.png              # App-Icon
```

## Tech Stack

- **Electron** — Cross-Platform Desktop Framework
- **xterm.js** — Terminal-Emulator im Browser
- **node-pty** — Pseudo-Terminal Binding fuer Node.js
- **Hugging Face Inference API** — KI-Autocomplete via router.huggingface.co

## Lizenz

MIT
