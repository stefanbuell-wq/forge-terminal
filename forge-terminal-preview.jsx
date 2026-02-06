import { useState } from "react";

const ForgeTerminalPreview = () => {
  const [autoAccept, setAutoAccept] = useState(false);
  const [acceptLevel, setAcceptLevel] = useState("safe");
  const [activeProvider, setActiveProvider] = useState("claude");
  const [activeTab, setActiveTab] = useState(1);
  const [tabs, setTabs] = useState([
    { id: 1, name: "⚡ Claude 1", active: true },
    { id: 2, name: "Terminal 2", active: false },
  ]);

  const terminalLines = [
    { type: "prompt", text: "stefan@pop-os:~/projects/spiritvault$" },
    { type: "cmd", text: " claude" },
    { type: "output", text: "" },
    { type: "ascii", text: "  ╭──────────────────────────────────────╮" },
    { type: "ascii", text: "  │  ⚡ Claude Code v2.1.4              │" },
    { type: "ascii", text: "  │  Model: claude-sonnet-4-5            │" },
    { type: "ascii", text: "  │  Auto-accept: enabled (YOLO)         │" },
    { type: "ascii", text: "  ╰──────────────────────────────────────╯" },
    { type: "output", text: "" },
    { type: "claude", text: "  Claude ▸ " },
    { type: "user-input", text: "Analysiere das Go-Backend und finde Performance-Bottlenecks" },
    { type: "output", text: "" },
    { type: "thinking", text: "  ⟳ Analysiere src/handlers/ ..." },
    { type: "thinking", text: "  ⟳ Prüfe Datenbankabfragen in models/ ..." },
    { type: "action", text: "  ✓ Lese: src/handlers/inventory.go" },
    { type: "action", text: "  ✓ Lese: src/models/spirits.go" },
    { type: "action-write", text: "  ⚡ Auto-Accept: src/handlers/inventory.go (optimiert N+1 Query)" },
    { type: "output", text: "" },
    { type: "response", text: "  Ich habe 3 Performance-Issues gefunden:" },
    { type: "response", text: "  1. N+1 Query in GetInventory — jetzt mit JOIN gelöst" },
    { type: "response", text: "  2. Fehlender Index auf spirits.distillery_id" },
    { type: "response", text: "  3. Unnötige JSON-Serialisierung im Cache-Layer" },
    { type: "output", text: "" },
    { type: "claude", text: "  Claude ▸ " },
    { type: "cursor", text: "█" },
  ];

  const providers = [
    { id: "claude", name: "Claude Code", dot: "bg-cyan-400", status: "v2.x", shadow: "shadow-[0_0_8px_rgba(34,211,238,0.5)]" },
    { id: "openai", name: "OpenAI Codex", dot: "bg-green-400", status: "soon", shadow: "shadow-[0_0_8px_rgba(74,222,128,0.4)]" },
    { id: "ollama", name: "Ollama Local", dot: "bg-orange-400", status: "soon", shadow: "shadow-[0_0_8px_rgba(251,146,60,0.4)]" },
  ];

  const levels = [
    { id: "safe", label: "Sicher — Nur Read-Ops", dot: "bg-green-400" },
    { id: "moderate", label: "Moderat — Read + Write", dot: "bg-orange-400" },
    { id: "yolo", label: "YOLO — Alles akzeptieren", dot: "bg-red-400" },
  ];

  return (
    <div className="w-full h-screen flex flex-col" style={{ background: "#070b10", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Title Bar */}
      <div className="h-10 flex items-center justify-between px-3 border-b" style={{ background: "#070b10", borderColor: "#1c2b3a" }}>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider" style={{ color: "#7a8da0" }}>
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          FORGE TERMINAL
        </div>
        <div className="flex gap-1">
          {["−", "□", "×"].map((icon, i) => (
            <button key={i} className={`w-8 h-6 flex items-center justify-center rounded text-xs ${i === 2 ? "hover:bg-red-500 hover:text-white" : "hover:bg-slate-700"}`} style={{ color: "#7a8da0" }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 flex flex-col flex-shrink-0 border-r" style={{ background: "#0a0e14", borderColor: "#1c2b3a" }}>
          
          {/* Providers */}
          <div className="p-3 border-b" style={{ borderColor: "#1c2b3a" }}>
            <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "#4a5b6e", fontSize: "10px" }}>AI PROVIDER</div>
            <div className="flex flex-col gap-1">
              {providers.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActiveProvider(p.id)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all border ${
                    activeProvider === p.id
                      ? "border-slate-600"
                      : "border-transparent hover:bg-slate-800"
                  }`}
                  style={activeProvider === p.id ? { background: "rgba(34,211,238,0.08)" } : {}}
                >
                  <span className={`w-2 h-2 rounded-full ${p.dot} ${p.shadow}`} />
                  <span className="text-xs font-medium" style={{ color: "#d4dce8" }}>{p.name}</span>
                  <span className="ml-auto text-xs" style={{ color: "#4a5b6e", fontSize: "10px" }}>{p.status}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Accept */}
          <div className="p-3 border-b" style={{ borderColor: "#1c2b3a" }}>
            <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "#4a5b6e", fontSize: "10px" }}>AUTO-ACCEPT</div>
            <div className="flex items-center justify-between px-2.5 py-2">
              <div>
                <div className="text-xs font-medium" style={{ color: "#d4dce8" }}>Aktiviert</div>
                <div className="text-xs mt-0.5" style={{ color: "#4a5b6e", fontSize: "10px" }}>Bestätigungen überspringen</div>
              </div>
              <button
                onClick={() => setAutoAccept(!autoAccept)}
                className="w-9 h-5 rounded-full relative transition-all flex-shrink-0"
                style={{
                  background: autoAccept ? "#22d3ee" : "#151f2c",
                  border: autoAccept ? "1px solid #22d3ee" : "1px solid #1c2b3a",
                }}
              >
                <span
                  className="absolute w-3.5 h-3.5 rounded-full top-0.5 transition-all"
                  style={{
                    background: autoAccept ? "white" : "#7a8da0",
                    left: autoAccept ? "18px" : "2px",
                  }}
                />
              </button>
            </div>
            {autoAccept && (
              <div className="flex flex-col gap-1 mt-2">
                {levels.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setAcceptLevel(l.id)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-all ${
                      acceptLevel === l.id ? "" : "hover:bg-slate-800"
                    }`}
                    style={{ color: acceptLevel === l.id ? "#d4dce8" : "#7a8da0" }}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${l.dot}`} />
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-3">
            <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "#4a5b6e", fontSize: "10px" }}>QUICK ACTIONS</div>
            <div className="flex flex-col gap-1">
              {[
                { icon: "⚡", label: "Claude Code starten" },
                { icon: "+", label: "Neuer Tab" },
                { icon: "🗑", label: "Terminal leeren" },
              ].map((a, i) => (
                <button key={i} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-left transition-all hover:bg-slate-800" style={{ color: "#7a8da0" }}>
                  <span className="w-4 text-center">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1" />
          <div className="p-3 border-t text-center" style={{ borderColor: "#1c2b3a", color: "#4a5b6e", fontSize: "10px" }}>
            Forge Terminal v0.1.0 — Built with ⚡
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar */}
          <div className="h-9 flex items-center px-2 gap-0.5 border-b" style={{ background: "#0a0e14", borderColor: "#1c2b3a" }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`h-7 px-3 flex items-center gap-2 rounded-md text-xs font-medium transition-all border ${
                  activeTab === t.id ? "border-slate-700" : "border-transparent hover:bg-slate-800"
                }`}
                style={{
                  background: activeTab === t.id ? "#0f1923" : "transparent",
                  color: activeTab === t.id ? "#d4dce8" : "#7a8da0",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {t.name}
              </button>
            ))}
            <button className="w-7 h-7 flex items-center justify-center rounded-md text-xs hover:bg-slate-800" style={{ color: "#4a5b6e" }}>+</button>
          </div>

          {/* Auto-Accept Banner */}
          {autoAccept && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs border-b" style={{
              background: "linear-gradient(90deg, rgba(251,146,60,0.06), rgba(248,113,113,0.06))",
              borderColor: "rgba(251,146,60,0.2)",
              color: "#fb923c",
              fontSize: "11px",
            }}>
              <span>⚠</span>
              Auto-Accept aktiv — Claude Code überspringt Bestätigungen ({acceptLevel.toUpperCase()})
            </div>
          )}

          {/* Terminal */}
          <div className="flex-1 overflow-auto p-3" style={{ background: "#0a0e14", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: "13px", lineHeight: "1.5" }}>
            {terminalLines.map((line, i) => {
              const colors = {
                prompt: "#4ade80",
                cmd: "#d4dce8",
                output: "transparent",
                ascii: "#22d3ee",
                claude: "#22d3ee",
                "user-input": "#d4dce8",
                thinking: "#7a8da0",
                action: "#4ade80",
                "action-write": "#fb923c",
                response: "#d4dce8",
                cursor: "#22d3ee",
              };
              return (
                <div key={i} style={{ color: colors[line.type] || "#d4dce8", minHeight: line.type === "output" ? "16px" : "auto" }}>
                  {line.type === "cursor" ? (
                    <span className="animate-pulse">{line.text}</span>
                  ) : (
                    line.text
                  )}
                </div>
              );
            })}
          </div>

          {/* Status Bar */}
          <div className="h-7 flex items-center justify-between px-3 border-t" style={{
            background: "#070b10",
            borderColor: "#1c2b3a",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            color: "#4a5b6e",
          }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px rgba(74,222,128,0.5)" }} />
                Bereit
              </div>
              <span>bash</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Claude Code</span>
              <span style={{ color: autoAccept ? "#fb923c" : "#4a5b6e" }}>
                Auto-Accept: {autoAccept ? acceptLevel.toUpperCase() : "Aus"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgeTerminalPreview;
