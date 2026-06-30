

class PortfolioService:

    def __init__(self, db, market_service):
        self.db = db
        self.market = market_service
    
    def _normalize_symbol(self, symbol):
        return str(symbol).strip().upper()
    
    
    def buy_stock(self, user_id, symbol, quantity):

        symbol = self._normalize_symbol(symbol)
        
        price = self.market.get_price(symbol)

        if quantity <= 0:
            return False
        
        if price is None:
            return False

        query = """ SELECT quantity, average_buy_price
        FROM portfolio
        WHERE user_id = ? AND symbol = ?
        """
        result = self.db.fetch_one(query, (user_id, symbol))

        if result:
            old_qty, old_price = result

            new_qty = old_qty + quantity

            new_avg = (
                old_qty * old_price + quantity * price
                ) / new_qty
            
            update_query = """
            UPDATE portfolio
            SET quantity = ?, average_buy_price = ?
            WHERE user_id = ? AND symbol = ?
            """

            self.db.execute(update_query, (new_qty, new_avg, user_id, symbol))
        else:
            insert_query = """
            INSERT INTO portfolio (user_id, symbol, quantity, average_buy_price)
            VALUES (?, ?, ?, ?)
            """
            self.db.execute(insert_query, (user_id, symbol, quantity, price))
        
        return True

    def sell_stock(self, user_id, symbol, quantity):

        symbol = self._normalize_symbol(symbol)

        if quantity <= 0:
            return False
        
        query = """
        SELECT quantity FROM portfolio
        WHERE user_id = ? AND symbol = ?
        """
        result = self.db.fetch_one(query, (user_id, symbol))

        if not result:
            return False
        
        current_qty = result[0]

        if quantity > current_qty:
            return False
        
        new_qty = current_qty - quantity

        if new_qty == 0:
            delete_query = """
            DELETE FROM portfolio
            WHERE user_id = ? AND symbol = ?
            """
            self.db.execute(delete_query, (user_id, symbol))
        
        else:
            update_query = """
            UPDATE portfolio
            SET quantity = ?
            WHERE user_id = ? AND symbol = ?
            """
            self.db.execute(update_query, (new_qty, user_id, symbol))
        
        return True

    def get_portfolio(self, user_id):

        query = """
        SELECT symbol, quantity, average_buy_price
        FROM portfolio
        WHERE user_id = ?
        """

        return self.db.fetch_all(query, (user_id,))
    

    def get_total_value(self, user_id):


        portfolio = self.get_portfolio(user_id)

        total = 0

        for symbol, quantity, _ in portfolio:
            current_price = self.market.get_price(symbol)

            if current_price is None:
                continue

            total += current_price * quantity

        return total

