#!/bin/bash
# ⚡ Forge Terminal — Quick Setup Script

set -e

echo ""
echo "  ⚡ Forge Terminal Setup"
echo "  ======================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nicht gefunden. Bitte installieren:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "   sudo apt install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ benötigt (aktuell: $(node -v))"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check build tools
if ! command -v make &> /dev/null; then
    echo "⚠️  Build-Tools fehlen. Installiere..."
    sudo apt install -y build-essential python3
fi
echo "✅ Build Tools"

# Check Claude Code
if command -v claude &> /dev/null; then
    echo "✅ Claude Code $(claude --version 2>/dev/null || echo 'installiert')"
else
    echo "⚠️  Claude Code nicht gefunden."
    read -p "   Jetzt installieren? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        curl -fsSL https://claude.ai/install.sh | bash
        source ~/.bashrc
    fi
fi

# Install npm dependencies
echo ""
echo "📦 Installiere Dependencies..."
npm install

# Rebuild node-pty for Electron
echo ""
echo "🔧 Rebuild node-pty für Electron..."
npx electron-rebuild 2>/dev/null || echo "⚠️  electron-rebuild fehlgeschlagen — versuche manuell: npx electron-rebuild"

echo ""
echo "  ✅ Setup abgeschlossen!"
echo ""
echo "  Starten mit:  npm start"
echo "  Dev-Mode:     npm run dev"
echo ""
