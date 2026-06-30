export const C = {
  bg: "#0a0a0a",
  panel: "#111111",
  panel2: "#161616",
  border: "#1e1e1e",
  border2: "#2a2a2a",
  green: "#3db560",
  greenDim: "rgba(61,181,96,0.12)",
  red: "#e05252",
  redDim: "rgba(224,82,82,0.10)",
  blue: "#4a8fe8",
  blueDim: "rgba(74,143,232,0.10)",
  text: "#f0f0f0",
  textSub: "#888888",
  textMuted: "#555555",
  amber: "#d4930a",
};

export const panelStyle = {
  background: C.panel,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
};

export const inputStyle = {
  background: "#0d0d0d",
  border: `1px solid ${C.border2}`,
  borderRadius: 8,
  color: C.text,
  padding: "10px 14px",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export const GLOBAL_STYLES = `
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  .row-hover:hover { background: #141414 !important; }
  .nav-item { background:none; border:none; cursor:pointer; color:#666; font-size:14px; font-weight:500; padding:8px 18px; border-radius:7px; transition:all 0.15s; letter-spacing:0.01em; }
  .nav-item:hover { color:#ccc; background:#161616; }
  .nav-item.active { color:#f0f0f0; background:#1a1a1a; }
  .btn-green { background:#3db560; color:#fff; border:none; padding:10px 22px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; transition:opacity 0.15s; letter-spacing:0.01em; }
  .btn-green:hover { opacity:0.85; }
  .btn-red { background:#e05252; color:#fff; border:none; padding:10px 22px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; transition:opacity 0.15s; }
  .btn-red:hover { opacity:0.85; }
  .btn-ghost { background:#161616; color:#aaa; border:1px solid #2a2a2a; padding:7px 14px; border-radius:7px; font-size:13px; cursor:pointer; transition:all 0.15s; }
  .btn-ghost:hover { background:#1e1e1e; color:#ddd; }
  .btn-ghost.active { background:#1e1e1e; color:#f0f0f0; border-color:#333; }
  .chip { background:#161616; border:1px solid #1e1e1e; color:#888888; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500; letter-spacing:0.03em; }
  input:focus { border-color:#333 !important; }
  .book-card { cursor:pointer; transition:transform 0.18s, border-color 0.18s; }
  .book-card:hover { transform:translateY(-3px); border-color:#333 !important; }
`;