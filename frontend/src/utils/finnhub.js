import { useEffect, useRef, useCallback } from "react";

// ─── კონფიგი ───────────────────────────────────────────────
// 1. finnhub.io-ზე შედი → Dashboard → API Key → დააკოპირე
// 2. ქვემოთ YOUR_FINNHUB_KEY-ის ნაცვლად ჩასვი
export const FINNHUB_KEY = "YOUR_FINNHUB_KEY";

// Finnhub-ის crypto სიმბოლოების mapping
// stocks: "AAPL", crypto: "BINANCE:BTCUSDT"
export const SYMBOL_MAP = {
  AAPL:  "AAPL",
  TSLA:  "TSLA",
  NVDA:  "NVDA",
  MSFT:  "MSFT",
  AMZN:  "AMZN",
  GOOGL: "GOOGL",
  META:  "META",
  JPM:   "JPM",
  BAC:   "BAC",
  BTC:   "BINANCE:BTCUSDT",
  ETH:   "BINANCE:ETHUSDT",
  SOL:   "BINANCE:SOLUSDT",
};

// reverse map: "BINANCE:BTCUSDT" → "BTC"
const REVERSE_MAP = Object.fromEntries(
  Object.entries(SYMBOL_MAP).map(([k, v]) => [v, k])
);

/**
 * Finnhub WebSocket hook.
 * 
 * @param {boolean} enabled  - true მხოლოდ dashboard-ზე
 * @param {function} onTrade - (symbol, price) callback
 * 
 * ლოგიკა:
 *  - WS-ი ხსნის კავშირს, subscribe-ს აგზავნის ყველა სიმბოლოზე
 *  - "trade" message-ზე → onTrade callback
 *  - market დახურვისას stocks-ი ჩერდება (crypto 24/7)
 *  - კავშირი გაწყვეტისას 3 წამში reconnect
 *  - cleanup: unsubscribe + close
 */
export function useFinnhubWS(enabled, onTrade) {
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!enabled || !mountedRef.current) return;
    if (FINNHUB_KEY === "YOUR_FINNHUB_KEY") {
      console.warn("⚠️  Finnhub API key არ არის დაყენებული — simulated mode");
      return;
    }

    const ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_KEY}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 Finnhub WS connected");
      Object.values(SYMBOL_MAP).forEach((sym) => {
        ws.send(JSON.stringify({ type: "subscribe", symbol: sym }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type !== "trade" || !msg.data?.length) return;

        // Finnhub ერთ message-ში რამდენიმე trade-ს აგზავნის
        // ვიღებთ ბოლოს (უახლეს) ფასს თითო სიმბოლოზე
        const latest = {};
        msg.data.forEach((trade) => {
          latest[trade.s] = trade.p; // s=symbol, p=price
        });

        Object.entries(latest).forEach(([finnSym, price]) => {
          const appSym = REVERSE_MAP[finnSym];
          if (appSym) onTrade(appSym, price);
        });
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onerror = (e) => console.error("WS error:", e);

    ws.onclose = () => {
      console.log("🔴 Finnhub WS closed — reconnecting in 3s…");
      if (mountedRef.current) {
        reconnectRef.current = setTimeout(connect, 3000);
      }
    };
  }, [enabled, onTrade]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        // unsubscribe სუფთად
        if (wsRef.current.readyState === WebSocket.OPEN) {
          Object.values(SYMBOL_MAP).forEach((sym) => {
            wsRef.current.send(JSON.stringify({ type: "unsubscribe", symbol: sym }));
          });
        }
        wsRef.current.close();
      }
    };
  }, [connect]);
}

/**
 * REST fallback — ერთჯერადი snapshot ყველა სიმბოლოზე.
 * გამოიყენება:
 *  - initial load-ზე (WS-მდე)
 *  - market-დახურვის შემდეგ განახლებისთვის
 * 
 * @returns {Promise<Object>} { AAPL: 195.4, BTC: 68000, ... }
 */
export async function fetchSnapshot() {
  if (FINNHUB_KEY === "YOUR_FINNHUB_KEY") return null;

  const results = {};
  // parallel requests
  await Promise.allSettled(
    Object.entries(SYMBOL_MAP).map(async ([appSym, finnSym]) => {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${finnSym}&token=${FINNHUB_KEY}`
        );
        const data = await res.json();
        if (data.c) results[appSym] = data.c; // c = current price
      } catch {
        // individual failure — skip
      }
    })
  );
  return results;
}
