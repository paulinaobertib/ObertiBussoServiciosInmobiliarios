# main.py
from fastapi import FastAPI, Query
import joblib
from surprise import SVD

app = FastAPI()
model = joblib.load("model/svd_model.pkl")

@app.get("/predict")
def predict(user_id: str = Query(...), property_id: int = Query(...)):
    try:
        pred = model.predict(user_id, property_id)
        return round(pred.est, 3)
    except Exception as e:
        return 0.0