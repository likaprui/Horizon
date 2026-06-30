from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)  # <-- აუცილებელი სვეტი
    hashed_password = Column(String)
    virtual_balance = Column(Float, default=10000.0)

    portfolio_items = relationship("Portfolio", back_populates="owner")

class Portfolio(Base):
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ticker = Column(String, index=True)
    quantity = Column(Float, default=0.0)
    avg_price = Column(Float, default=0.0)

    owner = relationship("User", back_populates="portfolio_items")