import { useState, useEffect, useCallback, useRef } from "react";
import { C, panelStyle, GLOBAL_STYLES } from "./constants";
import { STOCKS, BOOKS } from "./data";
import { genCandles } from "./utils/genCandles";
import { useFinnhubWS, fetchSnapshot, FINNHUB_KEY } from "./utils/finnhub";
import { LoginScreen, RegisterScreen, SuccessScreen, DashboardHeader } from "./components/AuthScreens";
import MarketsTab from "./components/MarketsTab";
import PortfolioTab from "./components/PortfolioTab";
import LeaderboardTab from "./components/LeaderboardTab";
import LibraryTab from "./components/LibraryTab";

export default function App() {
  /* ── Auth ── */
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);

  /* ── Tab ── */
  const [tab, setTab] = useState("markets");

  /* ── Markets UI state ── */
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);

  /* ── Live prices ── */
  const [liveStocks, setLiveStocks] = useState(STOCKS);
  const [charts, setCharts] = useState({});
  const [wsStatus, setWsStatus] = useState("idle"); // "idle" | "live" | "simulated"

  /* ── Trade state ── */
  const [portfolio, setPortfolio] = useState([]);
  const [toast, setToast] = useState(null);

  /* ── Portfolio view ── */
  const [portfolioSelected, setPortfolioSelected] = useState(null);

  /* ── Library ── */
  const [bookOpen, setBookOpen] = useState(null);
  const [bookPage, setBookPage] = useState(0);

  /* ── Chart seed ── */
  useEffect(() => {
    const d = {};
    STOCKS.forEach((s) => { d[s.symbol] = genCandles(s.price, 2880); }); // ~2 დღე, 1-წუთიანი candle-ები
    setCharts(d);

    // ფასების სინქრონიზაცია candle-seed-ის ბოლო close-თან, რომ პირველმა
    // live ტიკმა არ შექმნას უზარმაზარი "ხტომა" candle (open/close დისკონტინუითი)
    setLiveStocks((prev) =>
      prev.map((s) => {
        const seed = d[s.symbol];
        const lastClose = seed?.[seed.length - 1]?.close;
        if (lastClose == null) return s;
        const diff = lastClose - s.price;
        const change = parseFloat((s.change + diff).toFixed(2));
        const base = lastClose - change;
        const pct = base > 0 ? parseFloat(((change / base) * 100).toFixed(2)) : s.pct;
        return {
          ...s,
          price: parseFloat(lastClose.toFixed(lastClose > 100 ? 2 : 4)),
          change,
          pct,
        };
      })
    );
  }, []);

  /* ─────────────────────────────────────────────────────────
     REAL-TIME: Finnhub WebSocket
     onTrade callback — ყოველ ახალ ფასზე liveStocks განახლდება
  ───────────────────────────────────────────────────────── */
  const onTrade = useCallback((symbol, newPrice) => {
    setWsStatus("live");
    setLiveStocks((prev) =>
      prev.map((s) => {
        if (s.symbol !== symbol) return s;
        const diff = newPrice - s.price;
        const change = parseFloat((s.change + diff).toFixed(2));
        const base = newPrice - change;
        const pct = base > 0 ? parseFloat(((change / base) * 100).toFixed(2)) : s.pct;
        // chart-ს ახალი candle-ი დავამატოთ
        setCharts((prev) => {
          const existing = prev[symbol] ?? [];
          const last = existing[existing.length - 1];
          const newCandle = last
            ? {
                open: last.close,
                close: newPrice,
                high: Math.max(last.close, newPrice) * 1.001,
                low: Math.min(last.close, newPrice) * 0.999,
                time: Date.now(),
              }
            : { open: newPrice, close: newPrice, high: newPrice * 1.001, low: newPrice * 0.999, time: Date.now() };
          return {
            ...prev,
            [symbol]: [...existing.slice(-99), newCandle], // max 100 candles
          };
        });
        return { ...s, price: parseFloat(newPrice.toFixed(s.price > 100 ? 2 : 4)), change, pct };
      })
    );
  }, []);

  /* WebSocket — მხოლოდ dashboard-ზე */
  useFinnhubWS(screen === "app", onTrade);

  /* ─────────────────────────────────────────────────────────
     REST snapshot — initial load + simulated fallback
     API key არ არის ან market დახურულია → simulated ticker
  ───────────────────────────────────────────────────────── */
  useEffect(() => {
    if (screen !== "app") return;

    // initial snapshot (WS-ს პირველი trade-მდე ფასები განახლდება)
    if (FINNHUB_KEY !== "YOUR_FINNHUB_KEY") {
      fetchSnapshot().then((snap) => {
        if (!snap) return;
        setLiveStocks((prev) =>
          prev.map((s) =>
            snap[s.symbol]
              ? { ...s, price: parseFloat(snap[s.symbol].toFixed(s.price > 100 ? 2 : 4)) }
              : s
          )
        );
      });
    }

    // simulated fallback — API key გარეშე ან market დახურვისას
    const demoMode = FINNHUB_KEY === "YOUR_FINNHUB_KEY";
    if (!demoMode) return; // WS მუშაობს — sim არ გვჭირდება

    setWsStatus("simulated");

    // ერთი "ღია" candle-ის ინდექსი თითო symbol-ზე — განახლდება რამდენიმე ტიკზე,
    // შემდეგ იხურება და ახალი candle ემატება
    const tickCounters = {};
    const CANDLE_EVERY_N_TICKS = 4; // ახალი candle ყოველ მე-4 ტიკზე

    const t = setInterval(() => {
      setLiveStocks((prev) =>
        prev.map((s) => {
          const drift = (Math.random() - 0.49) * s.price * 0.0025;
          const np = Math.max(s.price + drift, 0.01);
          const nc = parseFloat((s.change + drift).toFixed(2));
          const base = np - nc;
          const npct = base > 0 ? parseFloat(((nc / base) * 100).toFixed(2)) : s.pct;
          const newPrice = parseFloat(np.toFixed(s.price > 100 ? 2 : 4));

          // candle-ების განახლება ამ symbol-ისთვის
          tickCounters[s.symbol] = (tickCounters[s.symbol] ?? 0) + 1;
          const shouldOpenNewCandle = tickCounters[s.symbol] % CANDLE_EVERY_N_TICKS === 0;

          setCharts((prevCharts) => {
            const existing = prevCharts[s.symbol] ?? [];
            const last = existing[existing.length - 1];

            if (!last) {
              return {
                ...prevCharts,
                [s.symbol]: [{ open: newPrice, close: newPrice, high: newPrice * 1.001, low: newPrice * 0.999, time: Date.now() }],
              };
            }

            if (shouldOpenNewCandle) {
              // წინა candle იხურება, ახალი იხსნება
              const newCandle = {
                open: last.close,
                close: newPrice,
                high: Math.max(last.close, newPrice) * 1.001,
                low: Math.min(last.close, newPrice) * 0.999,
                time: Date.now(),
              };
              return {
                ...prevCharts,
                [s.symbol]: [...existing.slice(-99), newCandle], // max 100 candles
              };
            }

            // არსებული (ღია) candle-ის high/low/close-ი ვაახლოთ (time არ იცვლება — candle ჯერ "ღიაა")
            const updatedLast = {
              ...last,
              close: newPrice,
              high: Math.max(last.high, newPrice),
              low: Math.min(last.low, newPrice),
            };
            return {
              ...prevCharts,
              [s.symbol]: [...existing.slice(0, -1), updatedLast],
            };
          });

          return {
            ...s,
            price: newPrice,
            change: nc,
            pct: npct,
          };
        })
      );
    }, 1500);
    return () => clearInterval(t);
  }, [screen]);

  /* ── Toast ── */
  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Auth handlers ── */
  const handleLogin = (userData) => {
    setUser(userData);
    setScreen("app");
    setTab("markets");
  };

  const handleLogout = () => {
    setUser(null);
    setPortfolio([]);
    setPortfolioSelected(null);
    setSelected(null);
    setWsStatus("idle");
    setScreen("login");
  };

  /* ── Balance helpers ── */
  const balance = user?.balance ?? 0;
  const setBalance = (updater) =>
    setUser((prev) => ({
      ...prev,
      balance: typeof updater === "function" ? updater(prev.balance) : updater,
    }));

  /* ── Trade handlers ── */
  const handleBuy = (stock) => {
    const cost = stock.price * qty;
    if (cost > balance) { showToast("Insufficient balance", true); return; }
    setBalance((b) => parseFloat((b - cost).toFixed(2)));
    setPortfolio((prev) => {
      const ex = prev.find((p) => p.symbol === stock.symbol);
      if (ex) {
        return prev.map((p) =>
          p.symbol === stock.symbol
            ? { ...p, qty: p.qty + qty, avgPrice: (p.avgPrice * p.qty + stock.price * qty) / (p.qty + qty) }
            : p
        );
      }
      return [...prev, { ...stock, qty, avgPrice: stock.price }];
    });
    showToast(`Bought ${qty} ${stock.symbol} @ $${stock.price.toFixed(2)}`);
    setPortfolioSelected(stock.symbol);
  };

  const handleSell = (symbol, sellQty = 1) => {
    const holding = portfolio.find((p) => p.symbol === symbol);
    if (!holding || holding.qty < sellQty) { showToast("Nothing to sell", true); return; }
    const stock = liveStocks.find((s) => s.symbol === symbol);
    const proceeds = (stock?.price ?? holding.avgPrice) * sellQty;
    setBalance((b) => parseFloat((b + proceeds).toFixed(2)));
    setPortfolio((prev) =>
      holding.qty <= sellQty
        ? prev.filter((p) => p.symbol !== symbol)
        : prev.map((p) => p.symbol === symbol ? { ...p, qty: p.qty - sellQty } : p)
    );
    showToast(`Sold ${sellQty} ${symbol} @ $${(stock?.price ?? holding.avgPrice).toFixed(2)}`);
  };

  /* ── Enriched portfolio ── */
  const enriched = portfolio.map((h) => {
    const live = liveStocks.find((s) => s.symbol === h.symbol);
    const cp = live?.price ?? h.avgPrice;
    const value = cp * h.qty;
    const pl = (cp - h.avgPrice) * h.qty;
    const plPct = ((cp - h.avgPrice) / h.avgPrice) * 100;
    return { ...h, cp, value, pl, plPct };
  });

  const totalValue = enriched.reduce((s, h) => s + h.value, 0);
  const totalInvested = enriched.reduce((s, h) => s + h.avgPrice * h.qty, 0);
  const totalPL = totalValue - totalInvested;
  const totalPLPct = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  /* ────────────────────────────────────────────
     AUTH SCREENS
  ──────────────────────────────────────────── */
  if (screen === "login")
    return <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen("register")} />;
  if (screen === "register")
    return <RegisterScreen onSuccess={() => setScreen("success")} onGoLogin={() => setScreen("login")} />;
  if (screen === "success")
    return <SuccessScreen onGoLogin={() => setScreen("login")} />;

  /* ────────────────────────────────────────────
     TRADING PLATFORM
  ──────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.err ? C.red : C.green, color: "#fff",
          padding: "11px 20px", borderRadius: 9, fontSize: 14, fontWeight: 500,
          animation: "fadeIn 0.25s ease", boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* WS status badge */}
      <div style={{
        position: "fixed", bottom: 16, right: 16, zIndex: 999,
        background: "#111", border: `1px solid ${C.border2}`,
        borderRadius: 8, padding: "6px 12px", fontSize: 11,
        display: "flex", alignItems: "center", gap: 6, color: C.textSub,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: wsStatus === "live" ? C.green : wsStatus === "simulated" ? C.amber : C.textMuted,
          animation: wsStatus !== "idle" ? "pulse 1.8s infinite" : "none",
        }} />
        {wsStatus === "live" ? "Finnhub Live" : wsStatus === "simulated" ? "Simulated" : "Connecting…"}
      </div>

      {/* Header */}
      <DashboardHeader
        user={user}
        activeTab={tab}
        onTabChange={setTab}
        onLogout={handleLogout}
      />

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 28px" }}>
        {tab === "markets" && (
          <MarketsTab
            liveStocks={liveStocks} charts={charts}
            search={search} setSearch={setSearch}
            sectorFilter={sectorFilter} setSectorFilter={setSectorFilter}
            selected={selected} setSelected={setSelected}
            qty={qty} setQty={setQty}
            onBuy={handleBuy} onSell={handleSell}
          />
        )}
        {tab === "portfolio" && (
          <PortfolioTab
            enriched={enriched} balance={balance}
            totalValue={totalValue} totalPL={totalPL} totalPLPct={totalPLPct}
            charts={charts}
            portfolioSelected={portfolioSelected} setPortfolioSelected={setPortfolioSelected}
            onSell={handleSell} onGoToMarkets={() => setTab("markets")}
          />
        )}
        {tab === "leaderboard" && <LeaderboardTab />}
        {tab === "library" && (
          <LibraryTab
            books={BOOKS} bookOpen={bookOpen} setBookOpen={setBookOpen}
            bookPage={bookPage} setBookPage={setBookPage}
          />
        )}
      </div>
    </div>
  );
}