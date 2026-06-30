import requests
import time



class StockMarketService:

    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://finnhub.io/api/v1"
        self.cache = {}
    
    def get_price(self, symbol):
        symbol = symbol.upper()

        if symbol in self.cache:
            price, timestamp = self.cache[symbol]
            if time.time() - timestamp < 15:
                return price
        
        url = f"{self.base_url}/quote"
        params = {
            "symbol": symbol,
            "token": self.api_key
        }

        response = requests.get(url, params=params)
        data = response.json()

        price = data.get("c")

        if price is None:
            return None
        
        self.cache[symbol] = (price, time.time())

        return price

service = StockMarketService("d91u1b9r01qg69gs10hgd91u1b9r01qg69gs10i0")
print(service.get_price("AAPL"))