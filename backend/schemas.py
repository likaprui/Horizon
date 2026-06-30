from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    virtual_balance: float

    class Config:
        from_attributes = True


class OrderRequest(BaseModel):
    user_id: int
    ticker: str
    quantity: float
    action: str  # "BUY" ან "SELL"