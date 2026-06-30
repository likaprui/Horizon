from datetime import datetime


class TradingEngine:

    def __init__(self, db, portfolio_service):
        self.db = db
        self.portfolio = portfolio_service
    
    def _get_user_balance(self, user_id):
        
        query = """
        SELECT balance
        FROM users
        WHERE user_id = ?
        """

        result = self.db.fetch_one(query, (user_id,))

        if result is None:
            return None
        
        return result[0]

    def _update_user_balance(self, user_id, new_balance):

        query = """
        UPDATE users
        SET balance = ?
        WHERE user_id = ?
        """

        self.db.execute(query, (new_balance, user_id))
        

    def _record_transaction(self, user_id, symbol, action, quantity, price):

        total = quantity * price
        transaction_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        asset_type = "STOCK"

        query = """
        INSERT INTO transactions
        (
            user_id,
            symbol,
            asset_type,
            action,
            quantity,
            price,
            total,
            transaction_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)"""

        self.db.execute(query, (user_id, symbol, asset_type, action, quantity, price, total, transaction_time))
    
    
    def buy_stock(self, user_id, symbol, quantity):


        if quantity <= 0:
            return False
        
        symbol = self.portfolio._normalize_symbol(symbol)
        price = self.portfolio.market.get_price(symbol)

        if price is None:
            return False
        
        total_cost = price * quantity
        balance = self._get_user_balance(user_id)

        if balance is None:
            return False
        
        if balance < total_cost:
            return False
        
        new_balance = balance - total_cost

        self._update_user_balance(user_id, new_balance)
        
        success = self.portfolio.buy_stock(user_id, symbol, quantity)

        if not success:
            return False
        
        self._record_transaction(user_id, symbol, "BUY", quantity, price)

        self.db.commit()
        return True

    def sell_stock(self, user_id, symbol, quantity):
        

        if quantity <= 0:
            return False
        
        symbol = self.portfolio._normalize_symbol(symbol)
        price = self.portfolio.market.get_price(symbol)

        if price is None:
            return False
        
        success = self.portfolio.sell_stock(user_id, symbol, quantity)

        if not success:
            return False
        
        balance = self._get_user_balance(user_id)

        if balance is None:
            return False
        
        total_sale = price * quantity
        
        new_balance = balance + total_sale

        self._update_user_balance(user_id, new_balance)

        self._record_transaction(user_id, symbol, "SELL", quantity, price)

        self.db.commit()
        return True