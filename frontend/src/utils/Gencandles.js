/**
 * Generates random candlestick data for a given base price.
 * @param {number} base - Starting price
 * @param {number} count - Number of candles to generate
 * @param {number} intervalMs - Time gap between candles (default 1 minute)
 * @returns {Array<{open, close, high, low, time}>}
 */
export function genCandles(base, count = 80, intervalMs = 60 * 1000) {
  const data = [];
  let price = base;
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const open = price;
    const change = (Math.random() - 0.485) * price * 0.022;
    const close = Math.max(open + change, open * 0.96);
    const high = Math.max(open, close) + Math.random() * price * 0.007;
    const low = Math.min(open, close) - Math.random() * price * 0.007;
    // ბოლო (count-1) candle = "ახლა", დანარჩენები წარსულში, intervalMs ნაბიჯით
    const time = now - (count - 1 - i) * intervalMs;
    data.push({ open, close, high, low, time });
    price = close;
  }
  return data;
}