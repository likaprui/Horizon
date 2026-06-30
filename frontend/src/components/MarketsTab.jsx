import { C, panelStyle, inputStyle } from "../constants";
import { Sparkline } from "./Charts";
import CandlestickChart from "./CandlestickChart";

/**
 * Markets tab — stock list + detail panel with candlestick & trading controls.
 */
export default function MarketsTab({
  liveStocks,
  charts,
  search,
  setSearch,
  sectorFilter,
  setSectorFilter,
  selected,
  setSelected,
  qty,
  setQty,
  onBuy,
  onSell,
}) {
  const sectors = ["All", ...Array.from(new Set(liveStocks.map((s) => s.sector)))];

  const filtered = liveStocks.filter((s) => {
    const matchSearch =
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase());
    const matchSector = sectorFilter === "All" || s.sector === sectorFilter;
    return matchSearch && matchSector;
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: selected ? "1fr 360px" : "1fr",
        gap: 20,
        alignItems: "start",
      }}
    >
      {/* ── Left: list ── */}
      <div>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <svg
              width="15" height="15" viewBox="0 0 15 15"
              style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            >
              <circle cx="6" cy="6" r="4.5" stroke="#555" strokeWidth="1.3" fill="none" />
              <line x1="10" y1="10" x2="13.5" y2="13.5" stroke="#555" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {sectors.slice(0, 5).map((s) => (
              <button
                key={s}
                className={`btn-ghost ${sectorFilter === s ? "active" : ""}`}
                onClick={() => setSectorFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ ...panelStyle, overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(180px,2fr) 1.2fr 1fr 0.9fr 80px",
              padding: "10px 20px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {["Asset", "Price", "24h", "Sector", "7D Chart"].map((h) => (
              <span
                key={h}
                style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}
              >
                {h}
              </span>
            ))}
          </div>

          {filtered.map((s, i) => {
            const isPos = s.change >= 0;
            const isSel = selected?.symbol === s.symbol;
            return (
              <div
                key={s.symbol}
                className="row-hover"
                onClick={() => setSelected(isSel ? null : s)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(180px,2fr) 1.2fr 1fr 0.9fr 80px",
                  padding: "13px 20px",
                  alignItems: "center",
                  borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
                  cursor: "pointer",
                  background: isSel ? "#141414" : "transparent",
                  transition: "background 0.12s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "#161616", border: `1px solid ${C.border2}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: isPos ? C.green : C.red, fontFamily: "monospace" }}>
                      {s.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.symbol}</div>
                    <div style={{ fontSize: 12, color: C.textSub, marginTop: 1 }}>{s.name}</div>
                  </div>
                </div>

                <div style={{ fontWeight: 600, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
                  ${s.price > 1000 ? s.price.toLocaleString("en-US", { maximumFractionDigits: 0 }) : s.price.toFixed(2)}
                </div>

                <div style={{ color: isPos ? C.green : C.red, fontWeight: 500, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
                  {isPos ? "+" : ""}{s.pct.toFixed(2)}%
                </div>

                <span className="chip">{s.sector}</span>
                <Sparkline data={charts[s.symbol]?.slice(-20)} positive={isPos} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: detail panel ── */}
      {selected && (() => {
        const live = liveStocks.find((s) => s.symbol === selected.symbol) ?? selected;
        const isPos = live.change >= 0;
        return (
          <div style={{ position: "sticky", top: 20 }}>
            <div style={{ ...panelStyle, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div
                        style={{
                          width: 36, height: 36, borderRadius: 9,
                          background: "#161616", border: `1px solid ${C.border2}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: isPos ? C.green : C.red, fontFamily: "monospace" }}>
                          {selected.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 17 }}>{live.symbol}</div>
                        <div style={{ fontSize: 12, color: C.textSub }}>{live.name}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <span style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                        ${live.price > 1000
                          ? live.price.toLocaleString("en-US", { maximumFractionDigits: 0 })
                          : live.price.toFixed(2)}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: isPos ? C.green : C.red }}>
                        {isPos ? "+" : ""}{live.pct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      background: "#161616", border: `1px solid ${C.border2}`,
                      color: C.textSub, borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontSize: 13,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div style={{ borderBottom: `1px solid ${C.border}`, background: "#0d0d0d", padding: "8px 0 4px" }}>
                <CandlestickChart data={charts[selected.symbol]} width={360} height={220} />
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: 1, borderBottom: `1px solid ${C.border}`, background: C.border,
                }}
              >
                {[
                  ["Open", `$${(live.price * 0.998).toFixed(2)}`],
                  ["Volume", "24.5M"],
                  ["Mkt Cap", live.symbol === "BTC" ? "$1.32T" : live.symbol === "ETH" ? "$420B" : "$840B"],
                  ["P/E", live.sector === "Crypto" ? "N/A" : "28.4"],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: C.panel, padding: "12px 16px" }}>
                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{l}</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Trade */}
              <div style={{ padding: "16px 20px" }}>
                <div style={{ fontSize: 12, color: C.textSub, marginBottom: 8 }}>Quantity</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={{
                      width: 34, height: 34, borderRadius: 7,
                      background: "#161616", border: `1px solid ${C.border2}`,
                      color: C.text, cursor: "pointer", fontSize: 18, lineHeight: 1,
                    }}
                  >−</button>
                  <input
                    type="number"
                    value={qty}
                    min={1}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ ...inputStyle, width: 70, textAlign: "center", padding: "7px 10px" }}
                  />
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    style={{
                      width: 34, height: 34, borderRadius: 7,
                      background: "#161616", border: `1px solid ${C.border2}`,
                      color: C.text, cursor: "pointer", fontSize: 18, lineHeight: 1,
                    }}
                  >+</button>
                  <span style={{ fontSize: 13, color: C.textSub, marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>
                    ${(live.price * qty).toFixed(2)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-green" style={{ flex: 1 }} onClick={() => onBuy(live)}>
                    Buy {live.symbol}
                  </button>
                  <button className="btn-red" style={{ flex: 1 }} onClick={() => onSell(live.symbol, 1)}>
                    Sell 1
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
