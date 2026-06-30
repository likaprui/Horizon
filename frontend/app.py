import sys
import requests
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLabel, QLineEdit, QPushButton, QStackedWidget, QFrame)
from PyQt5.QtCore import Qt
import pyqtgraph as pg

class LoginScreen(QWidget):
    def __init__(self, parent):
        super().__init__()
        self.parent = parent
        layout = QHBoxLayout(self)
        
        left_banner = QWidget()
        left_banner.setObjectName("leftBanner")
        left_layout = QVBoxLayout(left_banner)
        left_title = QLabel("Trade smarter\nwith AI insights")
        left_title.setStyleSheet("font-size: 28px; font-weight: bold; color: white;")
        left_desc = QLabel("Practice trading with $10,000 virtual capital.\nReal market data, AI-powered signals.")
        left_layout.addWidget(left_title)
        left_layout.addWidget(left_desc)
        left_layout.setAlignment(Qt.AlignCenter)
        
        right_form = QWidget()
        form_layout = QVBoxLayout(right_form)
        
        form_title = QLabel("Welcome back")
        form_title.setStyleSheet("font-size: 24px; font-weight: bold; color: white;")
        
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Username or Email")
        
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)
        
        self.error_label = QLabel("")
        self.error_label.setStyleSheet("color: #ff6b6b; font-size: 12px;")
        
        sign_in_btn = QPushButton("Sign in")
        sign_in_btn.setObjectName("primaryGreenBtn")
        sign_in_btn.clicked.connect(self.handle_login)
        
        go_to_reg_btn = QPushButton("New to QuantumTrader? Create a free account")
        go_to_reg_btn.setStyleSheet("color: #58a6ff; background: transparent; border: none;")
        go_to_reg_btn.clicked.connect(lambda: self.parent.setCurrentIndex(1))
        
        form_layout.addWidget(form_title)
        form_layout.addWidget(QLabel("Username or Email"))
        form_layout.addWidget(self.username_input)
        form_layout.addWidget(QLabel("Password"))
        form_layout.addWidget(self.password_input)
        form_layout.addWidget(self.error_label)
        form_layout.addWidget(sign_in_btn)
        form_layout.addWidget(go_to_reg_btn)
        form_layout.setAlignment(Qt.AlignCenter)
        
        layout.addWidget(left_banner, 1)
        layout.addWidget(right_form, 1)

    def handle_login(self):
        payload = {
            "username": self.username_input.text(),
            "email": self.username_input.text(),
            "password": self.password_input.text()
        }
        try:
            response = requests.post("http://127.0.0.1:8000/api/auth/login", json=payload)
            if response.status_code == 200:
                self.error_label.setStyleSheet("color: #2ea44f;")
                self.error_label.setText("Success! Loading dashboard...")
                
                # გადავიყვანოთ Dashboard-ის ეკრანზე (Index 3)
                self.parent.setCurrentIndex(3)
            else:
                error_msg = response.json().get("detail", "Login failed")
                self.error_label.setText(error_msg)
        except Exception as e:
            self.error_label.setText("Server connection failed.")

class RegisterScreen(QWidget):
    def __init__(self, parent):
        super().__init__()
        self.parent = parent
        layout = QHBoxLayout(self)
        
        left_banner = QWidget()
        left_banner.setObjectName("leftBanner")
        left_layout = QVBoxLayout(left_banner)
        left_title = QLabel("Your $10,000\ntrading journey\nstarts here")
        left_title.setStyleSheet("font-size: 28px; font-weight: bold; color: white;")
        left_layout.addWidget(left_title)
        left_layout.setAlignment(Qt.AlignCenter)
        
        right_form = QWidget()
        form_layout = QVBoxLayout(right_form)
        
        form_title = QLabel("Create your account")
        form_title.setStyleSheet("font-size: 24px; font-weight: bold; color: white;")
        
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("@username")
        
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("you@example.com")
        
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Min. 8 characters")
        self.password_input.setEchoMode(QLineEdit.Password)
        
        create_btn = QPushButton("Create account — get $10,000")
        create_btn.setObjectName("primaryGreenBtn")
        create_btn.clicked.connect(self.handle_register)
        
        form_layout.addWidget(form_title)
        form_layout.addWidget(QLabel("Username"))
        form_layout.addWidget(self.username_input)
        form_layout.addWidget(QLabel("Email address"))
        form_layout.addWidget(self.email_input)
        form_layout.addWidget(QLabel("Password"))
        form_layout.addWidget(self.password_input)
        form_layout.addWidget(create_btn)
        form_layout.setAlignment(Qt.AlignCenter)
        
        layout.addWidget(left_banner, 1)
        layout.addWidget(right_form, 1)

    def handle_register(self):
        payload = {
            "username": self.username_input.text(),
            "email": self.email_input.text(),
            "password": self.password_input.text()
        }
        try:
            response = requests.post("http://127.0.0.1:8000/api/auth/register", json=payload)
            if response.status_code == 200:
                self.parent.setCurrentIndex(2)
            else:
                print("Error:", response.text)
        except Exception as e:
            print("Server connection failed:", e)

class SuccessScreen(QWidget):
    def __init__(self, parent):
        super().__init__()
        self.parent = parent
        layout = QVBoxLayout(self)
        
        icon = QLabel("✓")
        icon.setStyleSheet("font-size: 70px; color: #2ea44f; font-weight: bold;")
        icon.setAlignment(Qt.AlignCenter)
        
        title = QLabel("Account created!")
        title.setStyleSheet("font-size: 28px; font-weight: bold; color: white;")
        title.setAlignment(Qt.AlignCenter)
        
        desc = QLabel("Welcome to QuantumTrader. Your $10,000 virtual balance is ready.")
        desc.setStyleSheet("color: #8b949e;")
        desc.setAlignment(Qt.AlignCenter)
        
        back_btn = QPushButton("Back to sign in")
        back_btn.setObjectName("secondaryDarkBtn")
        back_btn.clicked.connect(lambda: self.parent.setCurrentIndex(0))
        
        layout.addWidget(icon)
        layout.addWidget(title)
        layout.addWidget(desc)
        layout.addWidget(back_btn)
        layout.setAlignment(Qt.AlignCenter)

# 📊 ახალი ეკრანი: DASHBOARD და CANDLESTICK გრაფა
class DashboardScreen(QWidget):
    def __init__(self, parent):
        super().__init__()
        self.parent = parent
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(15, 15, 15, 15)
        
        # 1. ნავიგაციის ტოპ-ბარი
        top_bar = QHBoxLayout()
        logo = QLabel("📊 QuantumTrader")
        logo.setStyleSheet("font-size: 20px; font-weight: bold; color: white;")
        
        nav_dash = QPushButton("Dashboard")
        nav_dash.setStyleSheet("color: #58a6ff; font-weight: bold; background: transparent; border: none;")
        nav_markets = QPushButton("Markets")
        nav_markets.setStyleSheet("color: #8b949e; background: transparent; border: none;")
        nav_portfolio = QPushButton("Portfolio")
        nav_portfolio.setStyleSheet("color: #8b949e; background: transparent; border: none;")
        
        top_bar.addWidget(logo)
        top_bar.addSpacing(40)
        top_bar.addWidget(nav_dash)
        top_bar.addWidget(nav_markets)
        top_bar.addWidget(nav_portfolio)
        top_bar.addStretch()
        
        main_layout.addLayout(top_bar)
        main_layout.addSpacing(15)
        
        # 2. სტატისტიკის ბარათები (Cards)
        cards_layout = QHBoxLayout()
        
        card1 = self.create_stat_card("Portfolio Value", "$12,847", "+$2,847 (28.5%)", "#2ea44f")
        card2 = self.create_stat_card("Today's P&L", "+$341.20", "+2.73% Today", "#2ea44f")
        card3 = self.create_stat_card("Cash Balance", "$3,210", "25% of Portfolio", "#8b949e")
        
        cards_layout.addWidget(card1)
        cards_layout.addWidget(card2)
        cards_layout.addWidget(card3)
        
        main_layout.addLayout(cards_layout)
        main_layout.addSpacing(20)
        
        # 3. ცენტრალური ნაწილი: გრაფა და გვერდითა პანელი
        content_layout = QHBoxLayout()
        
        # მარცხენა მხარე: ჩარტის კონტეინერი
        chart_container = QWidget()
        chart_container.setStyleSheet("background-color: #161b22; border-radius: 8px;")
        chart_vbox = QVBoxLayout(chart_container)
        
        chart_title = QLabel("AAPL — Apple Inc.   <font color='#2ea44f'>$189.43 (+1.24%)</font>")
        chart_title.setStyleSheet("font-size: 16px; font-weight: bold; color: white;")
        chart_vbox.addWidget(chart_title)
        
        # PyQtGraph-ის გრაფიკის ინტეგრაცია
        self.plot_widget = pg.PlotWidget()
        self.plot_widget.setBackground('#161b22')
        self.generate_dummy_candles() # ვხატავთ დემო სანთლებს ვიზუალისთვის
        chart_vbox.addWidget(self.plot_widget)
        
        # მარჯვენა მხარე: ჰოლდინგები და განწყობა
        right_panel = QWidget()
        right_panel.setFixedWidth(280)
        right_panel.setStyleSheet("background-color: #161b22; border-radius: 8px; padding: 10px;")
        right_vbox = QVBoxLayout(right_panel)
        
        panel_title = QLabel("🛡️ AI Market Sentiment")
        panel_title.setStyleSheet("font-size: 15px; font-weight: bold; color: white;")
        sentiment_lbl = QLabel("68% Bullish Signal")
        sentiment_lbl.setStyleSheet("font-size: 24px; font-weight: bold; color: #2ea44f;")
        
        right_vbox.addWidget(panel_title)
        right_vbox.addWidget(sentiment_lbl)
        right_vbox.addStretch()
        
        content_layout.addWidget(chart_container, 3)
        content_layout.addWidget(right_panel, 1)
        
        main_layout.addLayout(content_layout)

    def create_stat_card(self, title, val, sub, color):
        card = QFrame()
        card.setStyleSheet("background-color: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 12px;")
        layout = QVBoxLayout(card)
        
        lbl_title = QLabel(title)
        lbl_title.setStyleSheet("color: #8b949e; font-size: 12px;")
        lbl_val = QLabel(val)
        lbl_val.setStyleSheet("color: white; font-size: 22px; font-weight: bold;")
        lbl_sub = QLabel(sub)
        lbl_sub.setStyleSheet(f"color: {color}; font-size: 11px;")
        
        layout.addWidget(lbl_title)
        layout.addWidget(lbl_val)
        layout.addWidget(lbl_sub)
        return card

    def generate_dummy_candles(self):
        # მარტივი ხაზოვანი დემო იმიტაცია სანთლებისთვის, სანამ ბაზას სრულად მივაბამთ
        x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        y = [182, 184, 183, 186, 185, 188, 187, 189, 188, 189.43]
        pen = pg.mkPen(color='#2ea44f', width=3)
        self.plot_widget.plot(x, y, pen=pen, symbol='o', symbolSize=6, symbolBrush='#2ea44f')

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("QuantumTrader")
        self.resize(1100, 750)
        
        self.stacked_widget = QStackedWidget()
        self.setCentralWidget(self.stacked_widget)
        
        self.login_page = LoginScreen(self.stacked_widget)
        self.register_page = RegisterScreen(self.stacked_widget)
        self.success_page = SuccessScreen(self.stacked_widget)
        self.dashboard_page = DashboardScreen(self.stacked_widget) # <-- ახალი გვერდი
        
        self.stacked_widget.addWidget(self.login_page)     # 0
        self.stacked_widget.addWidget(self.register_page)  # 1
        self.stacked_widget.addWidget(self.success_page)   # 2
        self.stacked_widget.addWidget(self.dashboard_page) # 3

if __name__ == "__main__":
    app = QApplication(sys.argv)
    
    with open("style.qss", "r", encoding="utf-8") as f:
        app.setStyleSheet(f.read())
        
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())