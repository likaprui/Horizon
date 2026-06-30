import { C, panelStyle } from "../constants";
import { LEADERBOARD } from "../data";

/**
 * Leaderboard tab — podium + full rankings table.
 */
export default function LeaderboardTab() {
  const podiumOrder = [LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]];
  const podiumHeights = ["160px", "200px", "140px"];
  const podiumAccents = ["#aaaaaa", "#c9a227", "#a0613a"];
  const podiumRankLabels = ["2nd", "1st", "3rd"];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.4px" }}>Top Traders</h2>
        <p style={{ color: C.textSub, fontSize: 14, marginTop: 6 }}>
          Global rankings based on portfolio returns. Resets monthly.
        </p>
      </div>

      {/* Podium */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr", gap: 12, marginBottom: 24, alignItems: "end" }}>
        {podiumOrder.map((u, i) => (
          <div
            key={u.rank}
            style={{
              ...panelStyle,
              padding: "24px 16px",
              height: podiumHeights[i],
              display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center",
              borderTop: `2px solid ${podiumAccents[i]}`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 11, color: podiumAccents[i], fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              {podiumRankLabels[i]}
            </div>
            <div
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#161616", border: `1px solid ${C.border2}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 12, color: podiumAccents[i],
                marginBottom: 10, fontFamily: "monospace", textTransform: "uppercase",
              }}
            >
              {u.name.slice(0, 2)}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{u.name}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.green, fontVariantNumeric: "tabular-nums" }}>
              +{u.return}%
            </div>
            <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>${u.balance.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...panelStyle, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "48px 2fr 1fr 1fr 1fr 1fr", padding: "10px 20px", borderBottom: `1px solid ${C.border}` }}>
          {["#", "Trader", "Return", "Balance", "Trades", "Best Trade"].map((h) => (
            <span key={h} style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {h}
            </span>
          ))}
        </div>
        {LEADERBOARD.map((u, i) => (
          <div
            key={u.rank}
            style={{
              display: "grid",
              gridTemplateColumns: "48px 2fr 1fr 1fr 1fr 1fr",
              padding: "14px 20px",
              alignItems: "center",
              borderBottom: i < LEADERBOARD.length - 1 ? `1px solid ${C.border}` : "none",
              background: u.isUser ? "rgba(74,143,232,0.05)" : "transparent",
            }}
          >
            <div
              style={{
                fontSize: 14, fontWeight: 700,
                color: u.rank <= 3 ? ["#c9a227", "#c9a227", "#aaa", "#a0613a"][u.rank - 1] : C.textMuted,
              }}
            >
              {u.rank}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: u.isUser ? "rgba(74,143,232,0.15)" : "#161616",
                  border: `1px solid ${u.isUser ? C.blue + "55" : C.border2}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 11,
                  color: u.isUser ? C.blue : C.textSub,
                  fontFamily: "monospace", textTransform: "uppercase",
                }}
              >
                {u.name.slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                {u.isUser && <div style={{ fontSize: 11, color: C.blue }}>you</div>}
              </div>
            </div>
            <div style={{ color: C.green, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>+{u.return}%</div>
            <div style={{ fontVariantNumeric: "tabular-nums" }}>${u.balance.toLocaleString()}</div>
            <div style={{ color: C.textSub }}>{u.trades}</div>
            <span
              style={{
                fontSize: 12, background: C.greenDim, color: C.green,
                padding: "4px 10px", borderRadius: 20, fontWeight: 500,
                display: "inline-block", width: "fit-content",
              }}
            >
              {u.best}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
