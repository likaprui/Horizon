import { useState, useRef, useEffect } from "react";
import { C, panelStyle } from "../constants";
import CandlestickChart from "./CandlestickChart";
import { DonutChart } from "./Charts";

/** კონტეინერის ფაქტობრივი სიგანე/სიმაღლის თვალთვალი (ResizeObserver) —
 * რომ chart რეალურად ავსებდეს მისთვის გამოყოფილ სივრცეს. */
function useElementSize(fallback) {
  const ref = useRef(null);
  const [size, setSize] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

/**
 * Portfolio tab — holdings table, P&L summary, allocation donut.
 */
export default function PortfolioTab({
  enriched,
  balance,
  totalValue,
  totalPL,
  totalPLPct,
  charts,
  portfolioSelected,
  setPortfolioSelected,
  onSell,
  onGoToMarkets,
}) {
  if (enriched.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: 16,
            background: "#161616", border: `1px solid ${C.border2}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5" strokeLinecap="round">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No positions yet</div>
        <div style={{ fontSize: 14, color: C.textSub, marginBottom: 24 }}>
          Go to Markets and place your first trade
        </div>
        <button className="btn-green" onClick={onGoToMarkets} style={{ padding: "10px 28px" }}>
          Go to Markets
        </button>
      </div>
    );
  }

  const activeSym = portfolioSelected ?? enriched[0]?.symbol;
  const activeH = enriched.find((h) => h.symbol === activeSym) ?? enriched[0];
  const totalInvested = enriched.reduce((s, h) => s + h.avgPrice * h.qty, 0);
  const allocationColors = [C.blue, C.green, C.amber, "#9b6fe0", C.red];
  const [chartFullscreen, setChartFullscreen] = useState(false);
  const [panelChartRef, panelChartSize] = useElementSize({ width: 700, height: 260 });
  const [fsChartRef, fsChartSize] = useElementSize({ width: 1340, height: 680 });

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { l: "Portfolio Value", v: `$${totalValue.toFixed(2)}` },
          { l: "Available Cash", v: `$${balance.toFixed(2)}` },
          {
            l: "Total P&L",
            v: `${totalPL >= 0 ? "+" : ""}$${totalPL.toFixed(2)}`,
            sub: `${totalPL >= 0 ? "+" : ""}${totalPLPct.toFixed(2)}%`,
            col: totalPL >= 0 ? C.green : C.red,
          },
          { l: "Open Positions", v: enriched.length },
        ].map((c) => (
          <div key={c.l} style={{ ...panelStyle, padding: "18px 20px" }}>
            <div
              style={{
                fontSize: 11, color: C.textMuted, textTransform: "uppercase",
                letterSpacing: "0.05em", marginBottom: 8,
              }}
            >
              {c.l}
            </div>
            <div
              style={{
                fontSize: 22, fontWeight: 700,
                color: c.col ?? C.text, fontVariantNumeric: "tabular-nums",
              }}
            >
              {c.v}
            </div>
            {c.sub && (
              <div style={{ fontSize: 13, color: c.col, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                {c.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
        <div>
          {/* Chart of selected holding */}
          <div style={{ ...panelStyle, marginBottom: 20, overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{activeH?.symbol} — Candlestick Chart</div>
                <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>
                  Click any holding below to switch chart
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 13, fontWeight: 600,
                    color: (activeH?.pl ?? 0) >= 0 ? C.green : C.red,
                    background: (activeH?.pl ?? 0) >= 0 ? C.greenDim : C.redDim,
                    padding: "4px 12px", borderRadius: 20,
                  }}
                >
                  {(activeH?.plPct ?? 0) >= 0 ? "+" : ""}{(activeH?.plPct ?? 0).toFixed(2)}%
                </span>
                <button
                  onClick={() => setChartFullscreen(true)}
                  title="გადიდება"
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: "#161616", border: `1px solid ${C.border2}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: C.textSub,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                  </svg>
                </button>
              </div>
            </div>
            <div ref={panelChartRef} style={{ background: "#0d0d0d", height: 300, padding: "14px 16px 4px" }}>
              <CandlestickChart
                data={charts[activeH?.symbol]}
                width={panelChartSize.width}
                height={panelChartSize.height}
                scrollable
                candleSpacing={9}
              />
            </div>
          </div>

          {/* Holdings table */}
          <div style={{ ...panelStyle, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, fontWeight: 600, fontSize: 14 }}>
              Holdings
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                padding: "9px 20px",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {["Asset", "Avg Cost", "Current", "Value", "P&L", ""].map((h) => (
                <span
                  key={h}
                  style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  {h}
                </span>
              ))}
            </div>
            {enriched.map((h, i) => (
              <div
                key={h.symbol}
                className="row-hover"
                onClick={() => setPortfolioSelected(h.symbol)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                  padding: "14px 20px",
                  alignItems: "center",
                  borderBottom: i < enriched.length - 1 ? `1px solid ${C.border}` : "none",
                  cursor: "pointer",
                  background: portfolioSelected === h.symbol ? "#141414" : "transparent",
                  borderLeft: portfolioSelected === h.symbol ? `2px solid ${C.green}` : "2px solid transparent",
                  transition: "background 0.12s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "#161616", border: `1px solid ${C.border2}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.textSub, fontFamily: "monospace" }}>
                      {h.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{h.symbol}</div>
                    <div style={{ fontSize: 12, color: C.textSub }}>{h.qty} shares</div>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontVariantNumeric: "tabular-nums" }}>${h.avgPrice.toFixed(2)}</div>
                <div style={{ fontSize: 14, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>${h.cp.toFixed(2)}</div>
                <div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>${h.value.toFixed(2)}</div>
                <div>
                  <div style={{ color: h.pl >= 0 ? C.green : C.red, fontWeight: 600, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
                    {h.pl >= 0 ? "+" : ""}${h.pl.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 12, color: h.pl >= 0 ? C.green : C.red, fontVariantNumeric: "tabular-nums" }}>
                    {h.plPct >= 0 ? "+" : ""}{h.plPct.toFixed(2)}%
                  </div>
                </div>
                <button
                  className="btn-red"
                  style={{ padding: "6px 14px", fontSize: 12 }}
                  onClick={(e) => { e.stopPropagation(); onSell(h.symbol, 1); }}
                >
                  Sell 1
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation donut */}
        <div style={{ ...panelStyle, padding: "20px" }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Allocation</div>
          <div style={{ fontSize: 12, color: C.textSub, marginBottom: 16 }}>Portfolio breakdown</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <DonutChart slices={enriched.map((h) => ({ symbol: h.symbol, value: h.value }))} />
          </div>
          {enriched.map((h, i) => (
            <div
              key={h.symbol}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "7px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 8, height: 8, borderRadius: 2,
                    background: allocationColors[i % allocationColors.length], flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{h.symbol}</span>
              </div>
              <span style={{ fontSize: 13, color: C.textSub, fontVariantNumeric: "tabular-nums" }}>
                {((h.value / totalValue) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen chart overlay */}
      {chartFullscreen && (
        <div
          onClick={() => setChartFullscreen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 32,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              ...panelStyle,
              width: "100%", maxWidth: 1400, height: "calc(100vh - 64px)",
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 24px", borderBottom: `1px solid ${C.border}`,
                display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 17 }}>{activeH?.symbol} — Candlestick Chart</div>
                <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>
                  მიმდინარე P&L: {(activeH?.plPct ?? 0) >= 0 ? "+" : ""}{(activeH?.plPct ?? 0).toFixed(2)}%
                </div>
              </div>
              <button
                onClick={() => setChartFullscreen(false)}
                title="დახურვა"
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: "#161616", border: `1px solid ${C.border2}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: C.textSub,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div ref={fsChartRef} style={{ background: "#0d0d0d", flex: 1, minHeight: 0, padding: "14px 18px 10px" }}>
              <CandlestickChart
                data={charts[activeH?.symbol]}
                width={fsChartSize.width}
                height={fsChartSize.height}
                scrollable
                candleSpacing={16}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}