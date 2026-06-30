import { C } from "../constants";

/**
 * Mini sparkline chart for market rows.
 * @param {{ data: Array, positive: boolean }} props
 */
export function Sparkline({ data, positive }) {
  if (!data || data.length < 2) return null;
  const prices = data.map((d) => d.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const w = 72, h = 28;
  const pts = prices
    .map((p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / (max - min + 0.001)) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block", flexShrink: 0 }}>
      <polyline
        points={pts}
        fill="none"
        stroke={positive ? C.green : C.red}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Donut chart for portfolio allocation.
 * @param {{ slices: Array<{symbol: string, value: number}> }} props
 */
export function DonutChart({ slices }) {
  const total = slices.reduce((s, h) => s + h.value, 0);
  const colors = [C.blue, C.green, C.amber, "#9b6fe0", C.red];
  let angle = -90;
  const cx = 70, cy = 70, r = 52, ir = 32;

  const arcs = slices.map((h, i) => {
    const pct = h.value / total;
    const sweep = pct * 360;
    const s = (Math.PI * angle) / 180;
    angle += sweep;
    const e = (Math.PI * angle) / 180;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const ix1 = cx + ir * Math.cos(s), iy1 = cy + ir * Math.sin(s);
    const ix2 = cx + ir * Math.cos(e), iy2 = cy + ir * Math.sin(e);
    const large = sweep > 180 ? 1 : 0;
    return {
      d: `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${ix2} ${iy2} A${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1}Z`,
      color: colors[i % colors.length],
    };
  });

  return (
    <svg width={140} height={140}>
      {arcs.map((a, i) => (
        <path key={i} d={a.d} fill={a.color} />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 10, fill: C.textSub }}>
        Total
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 13, fontWeight: 600, fill: C.text }}>
        ${total.toLocaleString("en-US", { maximumFractionDigits: 0 })}
      </text>
    </svg>
  );
}
