import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis } from 'recharts';

const API_KEY = 'cvn06spr01qhb16pa8e0cvn06spr01qhb16pa8eg';
const BASE = 'https://finnhub.io/api/v1';

const SECTORS = {
  'Electronic Technology': [
    { s: 'NVDA', n: 'NVIDIA Corp' }, { s: 'AAPL', n: 'Apple Inc' }, { s: 'AVGO', n: 'Broadcom Inc' },
    { s: 'AMD', n: 'Advanced Micro Devices' }, { s: 'INTC', n: 'Intel Corp' }, { s: 'QCOM', n: 'Qualcomm' }
  ],
  'Technology Services': [
    { s: 'MSFT', n: 'Microsoft Corp' }, { s: 'META', n: 'Meta Platforms' }, { s: 'GOOGL', n: 'Alphabet Inc' },
    { s: 'ORCL', n: 'Oracle Corp' }, { s: 'NFLX', n: 'Netflix Inc' }, { s: 'PLTR', n: 'Palantir Tech' }
  ],
  'Finance': [
    { s: 'JPM', n: 'JPMorgan Chase' }, { s: 'MA', n: 'Mastercard' },
    { s: 'V', n: 'Visa Inc' }, { s: 'BAC', n: 'Bank of America' }, { s: 'C', n: 'Citigroup' }
  ]
};

const TAB_STOCKS = {
  Financial: ['JPM', 'BAC', 'C', 'MA', 'V'],
  Technology: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META', 'AMD'],
  Services: ['NFLX', 'ORCL', 'PLTR']
};

const LOGOS = {
  NVDA: '#76b900', AAPL: '#555', AVGO: '#cc0000', AMD: '#ed1c24', INTC: '#0068b5', QCOM: '#3253dc',
  MSFT: '#f25022', META: '#0082fb', GOOGL: '#4285f4', ORCL: '#f80000', NFLX: '#e50914', PLTR: '#000',
  JPM: '#005eb8', MA: '#eb001b', V: '#1a1f71', BAC: '#e31837', C: '#003b70', TSLA: '#e82127'
};

export default function MarketOverview() {
  const [stocksData, setStocksData] = useState({});
  const [currentTab, setCurrentTab] = useState('Financial');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMatches, setSearchMatches] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [detailTimeframe, setDetailTimeframe] = useState('D');
  const [detailCandles, setDetailCandles] = useState([]);
  const [detailNews, setDetailNews] = useState([]);
  const [miniCandles, setMiniCandles] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', '#0d0d0f');
    root.style.setProperty('--surface', '#141418');
    root.style.setProperty('--surface2', '#1a1a20');
    root.style.setProperty('--border', '#2a2a35');
    root.style.setProperty('--text', '#e8e8f0');
    root.style.setProperty('--muted', '#6b6b80');
    root.style.setProperty('--green', '#26a69a');
    root.style.setProperty('--red', '#ef5350');
    root.style.setProperty('--accent', '#2962ff');
  }, []);

  const fetchQuote = async (symbol) => {
    try {
      const r = await fetch(`${BASE}/quote?symbol=${symbol}&token=${API_KEY}`);
      return await r.json();
    } catch { return null; }
  };

  const fetchCandles = async (symbol, resolution, from, to) => {
    try {
      const r = await fetch(`${BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`);
      const d = await r.json();
      return d.s === 'ok' ? d : null;
    } catch { return null; }
  };

  const loadAllData = async () => {
    setLastUpdated('Updating...');
    const allSymbols = Object.values(SECTORS).flat().map(e => e.s);
    const updatedData = { ...stocksData };

    await Promise.all(allSymbols.map(async (s) => {
      const q = await fetchQuote(s);
      if (q && q.c) updatedData[s] = q;
    }));

    setStocksData(updatedData);
    setLoading(false);
    setLastUpdated(`Updated ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`);
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 20000);

    const now = Math.floor(Date.now() / 1000);
    fetchCandles('AAPL', 'D', now - 30 * 86400, now).then(d => {
      if (d && d.c) {
        const formatted = d.c.map((val, idx) => ({ value: val }));
        setMiniCandles(formatted);
      }
    });

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchMatches([]);
      return;
    }
    const allEntries = Object.values(SECTORS).flat();
    const matches = allEntries.filter(e => e.s.startsWith(searchQuery.toUpperCase())).slice(0, 8);
    setSearchMatches(matches);
  }, [searchQuery]);

  useEffect(() => {
    if (!selectedStock) return;

    const loadDetail = async () => {
      const now = Math.floor(Date.now() / 1000);
      let from = now - 86400, res = '5';
      if (detailTimeframe === 'W') { from = now - 7 * 86400; res = '30'; }
      if (detailTimeframe === 'M') { from = now - 30 * 86400; res = 'D'; }

      const candles = await fetchCandles(selectedStock, res, from, now);
      if (candles && candles.c) {
        const formatted = candles.c.map((val) => ({ value: val }));
        setDetailCandles(formatted);
      }

      const weekAgo = now - 7 * 86400;
      try {
        const r = await fetch(`${BASE}/company-news?symbol=${selectedStock}&from=${new Date(weekAgo * 1000).toISOString().slice(0, 10)}&to=${new Date(now * 1000).toISOString().slice(0, 10)}&token=${API_KEY}`);
        const news = await r.json();
        setDetailNews(news.slice(0, 4));
      } catch { setDetailNews([]); }
    };

    loadDetail();
  }, [selectedStock, detailTimeframe]);

  const getFullName = (symbol) => {
    return Object.values(SECTORS).flat().find(e => e.s === symbol)?.n || symbol;
  };

  const getHeatColor = (pct) => {
    const c = Math.max(-3, Math.min(3, pct));
    if (c >= 0) return `rgb(13, ${Math.round(51 + (c / 3) * 115)}, 49)`;
    return `rgb(${Math.round(20 + (-c / 3) * 219)}, 20, 20)`;
  };

  // Recharts Area Chart Component
  const renderRechartsGrid = (data, height) => {
    if (!data || data.length < 2) return <div style={styles.loading}>No data to draw chart</div>;
    
    const isPositive = data[data.length - 1].value >= data[0].value;
    const strokeColor = isPositive ? '#26a69a' : '#ef5350';
    const fillColor = isPositive ? 'url(#colorGreen)' : 'url(#colorRed)';

    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#26a69a" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#26a69a" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef5350" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef5350" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <YAxis hide={true} domain={['dataMin - 1', 'dataMax + 1']} />
          <Area type="monotone" dataKey="value" stroke={strokeColor} strokeWidth={2} fill={fillColor} />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={styles.body}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logo} onClick={() => setSelectedStock(null)}>Market<span style={{ color: 'var(--accent)' }}>Pro</span></div>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchMatches.length > 0 && (
            <div style={styles.searchDropdown}>
              {searchMatches.map(e => (
                <div key={e.s} style={styles.searchItem} onClick={() => { setSelectedStock(e.s); setSearchQuery(''); }}>
                  <span style={styles.searchSym}>{e.s}</span>
                  <span style={styles.searchName}>{e.n}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={styles.headerRight}>
          <div style={styles.liveDot}></div>
          <span>{lastUpdated}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>
        {/* LEFT PANEL */}
        <div style={styles.leftPanel}>
          <div style={styles.panelSection}>
            <div style={styles.sectionTitle}>Market Overview</div>
            <div style={styles.tabs}>
              {['Financial', 'Technology', 'Services'].map(tab => (
                <button
                  key={tab}
                  style={{ ...styles.tab, ...(currentTab === tab ? styles.tabActive : {}) }}
                  onClick={() => setCurrentTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={styles.miniChartWrap}>
              {renderRechartsGrid(miniCandles, 70)}
            </div>
          </div>

          <div style={styles.panelSection}>
            {loading ? (
              <div style={styles.loading}>Loading stocks...</div>
            ) : (
              <div style={styles.stockList}>
                {TAB_STOCKS[currentTab].map(symbol => {
                  const q = stocksData[symbol];
                  if (!q) return null;
                  const pct = q.dp || 0;
                  const isPos = pct >= 0;
                  const logoClr = LOGOS[symbol] || '#666';

                  return (
                    <div key={symbol} style={styles.stockRow} onClick={() => setSelectedStock(symbol)}>
                      <div style={{ ...styles.stockLogo, backgroundColor: `${logoClr}22`, color: logoClr }}>{symbol.slice(0, 3)}</div>
                      <div style={styles.stockInfo}>
                        <div style={styles.stockSymbol}>{symbol}</div>
                        <div style={styles.stockName}>{getFullName(symbol)}</div>
                      </div>
                      <div style={styles.stockPriceCol}>
                        <div style={styles.stockPrice}>${q.c?.toFixed(2)}</div>
                        <div style={{ ...styles.stockChange, color: isPos ? 'var(--green)' : 'var(--red)' }}>
                          {isPos ? '+' : ''}{pct.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - HEATMAP */}
        <div style={styles.rightPanel}>
          <div style={styles.heatmapHeader}>
            <div style={styles.sectionTitle}>Stock Heatmap</div>
            <div style={styles.heatmapLegend}>
              <span>-3%</span>
              <div style={styles.legendBar}></div>
              <span>+3%</span>
            </div>
          </div>

          <div style={styles.heatmapGrid}>
            {Object.entries(SECTORS).map(([sector, stocks]) => (
              <div key={sector} style={styles.heatmapSector}>
                <div style={styles.sectorHeader}>{sector}</div>
                <div style={styles.sectorTiles}>
                  {stocks.map(entry => {
                    const q = stocksData[entry.s];
                    const pct = q ? (q.dp || 0) : 0;
                    return (
                      <div
                        key={entry.s}
                        style={{ ...styles.heatmapTile, backgroundColor: getHeatColor(pct) }}
                        onClick={() => setSelectedStock(entry.s)}
                      >
                        <div style={styles.tileSymbol}>{entry.s}</div>
                        <div style={styles.tileChange}>{pct >= 0 ? '+' : ''}{pct.toFixed(2)}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETAIL PAGE MODAL */}
      {selectedStock && stocksData[selectedStock] && (
        <div style={styles.detailPage}>
          <div style={styles.detailHeader}>
            <button style={styles.backBtn} onClick={() => setSelectedStock(null)}>← Back</button>
            <div style={styles.detailTitleWrap}>
              <div style={styles.detailSymbol}>{selectedStock}</div>
              <div style={styles.detailName}>{getFullName(selectedStock)}</div>
            </div>
            <div style={styles.detailPriceWrap}>
              <div style={styles.detailPrice}>${stocksData[selectedStock].c?.toFixed(2)}</div>
              <div style={{
                ...styles.detailChangeBadge,
                backgroundColor: stocksData[selectedStock].dp >= 0 ? 'rgba(38,166,154,0.15)' : 'rgba(239,83,80,0.15)',
                color: stocksData[selectedStock].dp >= 0 ? 'var(--green)' : 'var(--red)'
              }}>
                {stocksData[selectedStock].dp >= 0 ? '+' : ''}{stocksData[selectedStock].dp?.toFixed(2)}%
              </div>
            </div>
          </div>

          <div style={styles.detailBody}>
            <div style={styles.detailChartWrap}>
              <div style={styles.detailChartTop}>
                <span style={styles.detailChartLabel}>Price Chart</span>
                <div style={styles.detailTimeTabs}>
                  {['D', 'W', 'M'].map(tf => (
                    <button
                      key={tf}
                      style={{ ...styles.detailTimeTab, ...(detailTimeframe === tf ? styles.detailTimeTabActive : {}) }}
                      onClick={() => setDetailTimeframe(tf)}
                    >
                      {1 + tf}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: '#141418', borderRadius: '6px', padding: '10px' }}>
                {renderRechartsGrid(detailCandles, 220)}
              </div>
            </div>

            <div style={styles.detailStats}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>High Price</div>
                <div style={styles.statValue}>${stocksData[selectedStock].h?.toFixed(2)}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Low Price</div>
                <div style={styles.statValue}>${stocksData[selectedStock].l?.toFixed(2)}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Open Price</div>
                <div style={styles.statValue}>${stocksData[selectedStock].o?.toFixed(2)}</div>
              </div>
            </div>

            <div style={styles.detailNews}>
              <div style={styles.newsHeader}>Latest News</div>
              {detailNews.length === 0 ? <div style={styles.loading}>No recent news.</div> : 
                detailNews.map((n, idx) => (
                  <div key={idx} style={styles.newsItem} onClick={() => window.open(n.url, '_blank')}>
                    <div style={styles.newsDot}></div>
                    <div>
                      <div style={styles.newsHeadline}>{n.headline}</div>
                      <div style={styles.newsMeta}>{n.source}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  body: { background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontSize: '15px', fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.3px' },
  searchWrap: { position: 'relative', flex: 1, maxWidth: '380px', margin: '0 20px' },
  searchIcon: { position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '14px' },
  searchInput: { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '13px', padding: '7px 12px 7px 32px', outline: 'none' },
  searchDropdown: { position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', zIndex: 200, maxHeight: '250px', overflowY: 'auto' },
  searchItem: { display: 'flex', padding: '9px 14px', cursor: 'pointer', fontSize: '13px' },
  searchSym: { fontWeight: 700, width: '60px' },
  searchName: { color: 'var(--muted)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--muted)' },
  liveDot: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)' },
  main: { display: 'grid', gridTemplateColumns: '400px 1fr', height: 'calc(100vh - 49px)' },
  leftPanel: { borderRight: '1px solid var(--border)', overflowY: 'auto' },
  panelSection: { padding: '16px', borderBottom: '1px solid var(--border)' },
  sectionTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--text)' },
  tabs: { display: 'flex', gap: '4px', margin: '14px 0' },
  tab: { padding: '5px 12px', borderRadius: '5px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--muted)', background: 'transparent', border: 'none' },
  tabActive: { background: 'var(--surface2)', color: 'var(--text)' },
  miniChartWrap: { background: 'var(--surface2)', borderRadius: '8px', padding: '10px', height: '90px' },
  stockList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  stockRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '7px', cursor: 'pointer' },
  stockLogo: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 },
  stockInfo: { flex: 1, minWidth: 0 },
  stockSymbol: { fontSize: '13px', fontWeight: 700 },
  stockName: { fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  stockPriceCol: { textAlign: 'right' },
  stockPrice: { fontSize: '13px', fontWeight: 700 },
  stockChange: { fontSize: '11px', fontWeight: 600 },
  rightPanel: { overflowY: 'auto', padding: '20px' },
  heatmapHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  heatmapLegend: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--muted)' },
  legendBar: { width: '80px', height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, var(--red), #555, var(--green))' },
  heatmapGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  heatmapSector: { borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' },
  sectorHeader: { padding: '6px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', background: 'var(--surface)' },
  sectorTiles: { display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '6px', background: 'var(--surface2)' },
  heatmapTile: { borderRadius: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: '1 0 100px', minHeight: '60px' },
  tileSymbol: { fontSize: '12px', fontWeight: 800, color: '#fff' },
  tileChange: { fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' },
  loading: { display: 'flex', justifyContent: 'center', padding: '20px', color: 'var(--muted)', fontSize: '13px' },
  detailPage: { position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 300, overflowY: 'auto' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0 },
  backBtn: { background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },
  detailTitleWrap: { flex: 1 },
  detailSymbol: { fontSize: '22px', fontWeight: 800 },
  detailName: { fontSize: '13px', color: 'var(--muted)' },
  detailPriceWrap: { textAlign: 'right' },
  detailPrice: { fontSize: '26px', fontWeight: 800 },
  detailChangeBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: '5px', fontSize: '13px', fontWeight: 700, marginTop: '4px' },
  detailBody: { padding: '20px' },
  detailChartWrap: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '18px' },
  detailChartTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  detailChartLabel: { fontSize: '12px', color: 'var(--muted)', fontWeight: 600 },
  detailTimeTabs: { display: 'flex', gap: '4px' },
  detailTimeTab: { padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: 'var(--muted)', background: 'transparent', border: 'none' },
  detailTimeTabActive: { background: 'var(--surface2)', color: 'var(--text)' },
  detailStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' },
  statCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '9px', padding: '14px' },
  statLabel: { fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '6px' },
  statValue: { fontSize: '17px', fontWeight: 800 },
  detailNews: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' },
  newsHeader: { padding: '12px 16px', fontSize: '13px', fontWeight: 700, borderBottom: '1px solid var(--border)' },
  newsItem: { padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', gap: '12px' },
  newsDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', marginTop: '6px' },
  newsHeadline: { fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' },
  newsMeta: { fontSize: '11px', color: 'var(--muted)' }
};