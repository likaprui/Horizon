import { useState, useRef, useLayoutEffect } from "react";
import { C } from "../constants";

const TIMEFRAMES = [
  { key: "1m", label: "1წთ", ms: 60 * 1000 },
  { key: "5m", label: "5წთ", ms: 5 * 60 * 1000 },
  { key: "15m", label: "15წთ", ms: 15 * 60 * 1000 },
  { key: "1h", label: "1სთ", ms: 60 * 60 * 1000 },
  { key: "4h", label: "4სთ", ms: 4 * 60 * 60 * 1000 },
  { key: "1d", label: "დღიური", ms: 24 * 60 * 60 * 1000 },
];

/**
 * აგრეგირებს ნედლ (მაგ. 1-წუთიან) candle-მონაცემებს უფრო დიდ დროით ბაკეტებად.
 * @param {Array<{open,high,low,close,time}>} data
 * @param {number} intervalMs
 */
function aggregateCandles(data, intervalMs) {
  if (!data || data.length === 0) return [];
  const buckets = new Map();
  for (const d of data) {
    const t = d.time ?? 0;
    const bucketKey = Math.floor(t / intervalMs) * intervalMs;
    const existing = buckets.get(bucketKey);
    if (!existing) {
      buckets.set(bucketKey, { open: d.open, high: d.high, low: d.low, close: d.close, time: bucketKey });
    } else {
      existing.high = Math.max(existing.high, d.high);
      existing.low = Math.min(existing.low, d.low);
      existing.close = d.close; // ბოლო candle ამ ბაკეტში განსაზღვრავს close-ს
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
}

/**
 * SVG candlestick chart component with hover tooltip, time axis,
 * and optional horizontal scroll/zoom to reveal older candles.
 *
 * @param {{
 *   data: Array,
 *   width?: number,
 *   height?: number,
 *   scrollable?: boolean,   // თუ true — candle-ები ფიქსირებული სიგანის არიან და chart იხსნება სქროლადად
 *   candleSpacing?: number, // px თითო candle-ზე, scrollable რეჟიმში (default 9)
 * }} props
 */
export default function CandlestickChart({
  data: rawData,
  width = 660,
  height = 240,
  scrollable = false,
  candleSpacing = 9,
  defaultTimeframe = "1m",
}) {
  const [hover, setHover] = useState(null); // { index, x, y }
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const scrollRef = useRef(null);
  const stickToEndRef = useRef(true);
  const prevLenRef = useRef(0);

  if (!rawData || rawData.length === 0) return null;

  const tf = TIMEFRAMES.find((t) => t.key === timeframe) ?? TIMEFRAMES[0];
  const data = timeframe === "1m" ? rawData : aggregateCandles(rawData, tf.ms);
  // ერთი candle-ის სიგანე (px) დროის ჩარჩოს მიხედვით — რაც უფრო დიდი ინტერვალია,
  // მით უფრო ფართო candle ჩანს, შესაბამისი დეტალურობით
  const zoom = { "1m": candleSpacing, "5m": candleSpacing + 3, "15m": candleSpacing + 5, "1h": candleSpacing + 8, "4h": candleSpacing + 11, "1d": candleSpacing + 14 }[timeframe] ?? candleSpacing;

  // scrollable რეჟიმში timeframe-ღილაკების ზოლი ცალკე ფართობს იკავებს — height
  // prop წარმოადგენს მთლიან ხელმისაწვდომ სივრცეს, აქედან გამოვაკლოთ ღილაკების სიმაღლე
  const TF_BAR_H = 38;
  const svgHeight = scrollable ? Math.max(120, height - TF_BAR_H) : height;

  const pad = { left: 56, right: 12, top: 14, bottom: 28 };
  const h = svgHeight - pad.top - pad.bottom;

  // ჩვეულებრივი (fit-to-width) რეჟიმი vs scrollable (ფიქსირებული spacing) რეჟიმი.
  // scrollable რეჟიმში candle-ის სიგანე ყოველთვის მუდმივია (= zoom), მონაცემების
  // რაოდენობის მიუხედავად — ეს გამორიცხავს chart-ის "გაჭიმვას/შეკუმშვას" ახალი
  // candle-ის დამატებისას. თუ candle-ები კონტეინერზე ნაკლებს იკავებენ, უბრალოდ
  // თავისუფალი ადგილი რჩება მარჯვნივ (ეს ნორმალურია, scroll უბრალოდ არ სჭირდება).
  const innerW = scrollable ? data.length * zoom : width - pad.left - pad.right;
  const svgWidth = scrollable ? Math.max(innerW + pad.left + pad.right, width) : width;

  const prices = data.flatMap((d) => [d.high, d.low]);
  const minP = Math.min(...prices) * 0.9985;
  const maxP = Math.max(...prices) * 1.0015;
  const sy = (v) => h - ((v - minP) / (maxP - minP)) * h;
  const gap = innerW / data.length;
  const cw = Math.max(2, gap * 0.65);
  const gridVals = [0.2, 0.4, 0.6, 0.8].map((t) => minP + t * (maxP - minP));
  const fmt = (v) =>
    v > 9999
      ? `${(v / 1000).toFixed(1)}k`
      : v > 999
      ? `${(v / 1000).toFixed(2)}k`
      : v.toFixed(2);

  const fmtTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    if (timeframe === "1d") {
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
    if (timeframe === "4h" || timeframe === "1h") {
      return `${d.toLocaleDateString([], { day: "numeric", month: "short" })} ${d.toLocaleTimeString([], { hour: "2-digit" })}`;
    }
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const fmtDateTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${fmtTime(ts)}`;
  };

  // x-ღერძის ლეიბლები — ვირჩევთ მარჯვენა კიდიდან (უახლესი candle) უკან, მკაცრი
  // pixel-დაშორებით, რომ ტექსტები არასდროს გადაფარონ ან არ "გადაცდნენ" chart-ის კიდეს.
  const minLabelGap = timeframe === "1h" || timeframe === "4h" ? 96 : timeframe === "1d" ? 64 : 70;
  const axisLabels = [];
  {
    let lastX = Infinity;
    for (let i = data.length - 1; i >= 0; i--) {
      const x = pad.left + i * gap + gap / 2;
      if (x < pad.left + 24) break; // ძალიან ახლოს y-ღერძის ლეიბლებთან — ვჩერდებით
      if (lastX - x >= minLabelGap) {
        axisLabels.push({ d: data[i], i, x });
        lastX = x;
      }
    }
  }

  const hd = hover != null ? data[hover.index] : null;
  const bull = hd ? hd.close >= hd.open : false;

  const TT_W = 138;
  const TT_H = 104;
  let ttX = hover ? hover.x + 10 : 0;
  if (hover && ttX + TT_W > svgWidth - 4) ttX = hover.x - TT_W - 10;
  let ttY = hover ? Math.max(4, Math.min(svgHeight - TT_H - 4, hover.y - TT_H / 2)) : 0;

  // ავტო-სქროლი ბოლომდე (უახლესი candle) ახალი მონაცემის მოსვლისას —
  // მაგრამ მხოლოდ თუ მომხმარებელს არ აქვს ხელით უკან გადახედილი
  useLayoutEffect(() => {
    if (!scrollable || !scrollRef.current) return;
    const grew = data.length !== prevLenRef.current;
    prevLenRef.current = data.length;
    if (grew && stickToEndRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [data.length, scrollable, zoom, timeframe]);

  const handleTimeframeChange = (key) => {
    stickToEndRef.current = true;
    setTimeframe(key);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    stickToEndRef.current = el.scrollWidth - el.scrollLeft - el.clientWidth < 24;
  };

  const chartSvg = (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{ display: "block" }}
      onMouseLeave={() => setHover(null)}
    >
      {gridVals.map((gv, i) => {
        const gy = pad.top + sy(gv);
        return (
          <g key={i}>
            <line x1={pad.left} x2={svgWidth - pad.right} y1={gy} y2={gy} stroke="#1e1e1e" strokeWidth="1" />
            <text
              x={pad.left - 6}
              y={gy + 4}
              textAnchor="end"
              style={{ fontSize: 9, fill: C.textMuted, fontFamily: "monospace" }}
            >
              ${fmt(gv)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const x = pad.left + i * gap + gap / 2;
        const bullI = d.close >= d.open;
        const col = bullI ? C.green : C.red;
        const bodyTop = pad.top + Math.min(sy(d.open), sy(d.close));
        const bodyH = Math.max(1, Math.abs(sy(d.open) - sy(d.close)));
        const isActive = hover?.index === i;
        return (
          <g
            key={i}
            style={{ cursor: "crosshair" }}
            onMouseEnter={() => setHover({ index: i, x, y: pad.top + sy(d.close) })}
            onMouseMove={() => setHover({ index: i, x, y: pad.top + sy(d.close) })}
          >
            <rect x={x - gap / 2} y={pad.top} width={gap} height={h} fill="transparent" />
            <line
              x1={x} x2={x}
              y1={pad.top + sy(d.high)}
              y2={pad.top + sy(d.low)}
              stroke={col}
              strokeWidth={isActive ? 1.2 : 0.8}
              opacity={isActive ? 1 : 0.7}
              style={{ transition: "opacity 0.1s, stroke-width 0.1s" }}
            />
            <rect
              x={x - cw / 2}
              y={bodyTop}
              width={cw}
              height={bodyH}
              fill={col}
              opacity={isActive ? 1 : 0.9}
              stroke={isActive ? col : "none"}
              strokeWidth={isActive ? 1 : 0}
              style={{ transition: "opacity 0.1s" }}
            />
          </g>
        );
      })}

      {/* დროის ღერძი */}
      <line x1={pad.left} x2={svgWidth - pad.right} y1={pad.top + h} y2={pad.top + h} stroke="#262626" strokeWidth="1" />
      {axisLabels.map(({ d, i, x }) => (
        <g key={i}>
          <line x1={x} x2={x} y1={pad.top + h} y2={pad.top + h + 4} stroke="#262626" strokeWidth="1" />
          <text
            x={x}
            y={pad.top + h + 17}
            textAnchor="middle"
            style={{ fontSize: 9.5, fill: C.textMuted, fontFamily: "monospace", letterSpacing: "0.02em" }}
          >
            {fmtTime(d.time)}
          </text>
        </g>
      ))}

      {hover && hd && (
        <g pointerEvents="none">
          <line
            x1={pad.left} x2={svgWidth - pad.right}
            y1={hover.y} y2={hover.y}
            stroke={C.textMuted} strokeWidth="0.6" strokeDasharray="3 3" opacity="0.5"
          />
          <line
            x1={hover.x} x2={hover.x}
            y1={pad.top} y2={pad.top + h}
            stroke={C.textMuted} strokeWidth="0.6" strokeDasharray="3 3" opacity="0.5"
          />

          <g transform={`translate(${ttX}, ${ttY})`}>
            <rect
              width={TT_W} height={TT_H} rx={6}
              fill="#141414" stroke={C.border2 || "#262626"} strokeWidth="1"
            />
            <text x={10} y={16} style={{ fontSize: 10, fontWeight: 700, fill: bull ? C.green : C.red, fontFamily: "monospace" }}>
              {bull ? "▲" : "▼"} {bull ? "Bullish" : "Bearish"}
            </text>
            <text x={10} y={32} style={{ fontSize: 10, fill: C.textMuted, fontFamily: "monospace" }}>
              O <tspan fill={C.text}>${hd.open.toFixed(2)}</tspan>
            </text>
            <text x={10} y={45} style={{ fontSize: 10, fill: C.textMuted, fontFamily: "monospace" }}>
              H <tspan fill={C.text}>${hd.high.toFixed(2)}</tspan>
            </text>
            <text x={10} y={58} style={{ fontSize: 10, fill: C.textMuted, fontFamily: "monospace" }}>
              L <tspan fill={C.text}>${hd.low.toFixed(2)}</tspan>
            </text>
            <text x={10} y={71} style={{ fontSize: 10, fill: C.textMuted, fontFamily: "monospace" }}>
              C <tspan fill={C.text}>${hd.close.toFixed(2)}</tspan>
            </text>
            <text x={10} y={86} style={{ fontSize: 9, fill: C.textMuted, fontFamily: "monospace" }}>
              {hd.time ? fmtDateTime(hd.time) : `#${hover.index}`}
            </text>
          </g>
        </g>
      )}
    </svg>
  );

  if (!scrollable) return chartSvg;

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10, padding: "0 4px" }}>
        {TIMEFRAMES.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTimeframeChange(t.key)}
            style={{
              padding: "5px 11px", borderRadius: 6, fontSize: 11.5, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              background: timeframe === t.key ? (C.greenDim ?? "#0f2e1f") : "#161616",
              color: timeframe === t.key ? C.green : C.textSub,
              border: `1px solid ${timeframe === t.key ? C.green : (C.border2 ?? "#262626")}`,
              transition: "background 0.12s, color 0.12s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ overflowX: "auto", overflowY: "hidden" }}
      >
        {chartSvg}
      </div>
    </div>
  );
}