import time
import requests
import yfinance as yf

def get_crypto_price(coin_id="bitcoin"):
    try:
        # CoinGecko simple price endpoint (No API key needed for basic public requests)
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd"
        response = requests.get(url).json()
        return response[coin_id]['usd']
    except Exception as e:
        return f"Error fetching crypto: {e}"

def get_stock_price(ticker="AAPL"):
    try:
        # yfinance fetches the most recent market snapshot
        stock = yf.Ticker(ticker)
        # fast_info gives quick access to the latest price
        return stock.fast_info['last_price']
    except Exception as e:
        return f"Error fetching stock: {e}"

# Simulation Loop (Every 20 seconds)
while True:
    btc_price = get_crypto_price("bitcoin")
    aapl_price = get_stock_price("AAPL")
    
    print("--- Market Update ---")
    print(f"Bitcoin (BTC): ${btc_price}")
    print(f"Apple (AAPL):  ${aapl_price:.2f}")
    
    # Pause for 20 seconds before fetching again
    time.sleep(20)