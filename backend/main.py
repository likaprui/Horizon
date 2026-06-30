from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, database
import hashlib

# ქმნის ახალ ცხრილებს თუ არ არსებობს
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="QuantumTrader API")

# ჩართულია CORS (აქრობს 405 ერორებს)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# 1. რეგისტრაცია
@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    db_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hash_password(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pwd)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# 2. ავტორიზაცია (სრულიად დამოუკიდებელი, მხოლოდ 1 სუფთა ფუნქცია!)
@app.post("/api/auth/login")
async def login_user(payload: dict, db: Session = Depends(database.get_db)):
    username_or_email = payload.get("username")
    password = payload.get("password")
    
    if not username_or_email or not password:
        raise HTTPException(status_code=400, detail="Missing username or password")

    # ვეძებთ ბაზაში იუზერნეიმით ან მეილით
    db_user = db.query(models.User).filter(
        (models.User.username == username_or_email) | (models.User.email == username_or_email)
    ).first()
    
    # თუ ვერ მოიძებნა ან პაროლი არასწორია
    if not db_user or db_user.hashed_password != hash_password(password):
        raise HTTPException(status_code=400, detail="Incorrect username/email or password")
    
    return {
        "status": "success",
        "user": {"username": db_user.username, "balance": getattr(db_user, 'virtual_balance', 10000)}
    }

# 3. მარკეტის ფასები
@app.get("/api/market/price/{ticker}")
def get_market_price(ticker: str):
    import yfinance as tf
    try:
        stock = tf.Ticker(ticker)
        data = stock.history(period="1d")
        if data.empty:
            raise HTTPException(status_code=404, detail="Ticker not found")
        current_price = data['Close'].iloc[-1]
        return {"ticker": ticker.upper(), "price": round(current_price, 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))