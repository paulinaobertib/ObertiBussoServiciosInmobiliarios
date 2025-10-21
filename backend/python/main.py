from fastapi import FastAPI, Query
import joblib

from train_utils import entrenar_modelo

app = FastAPI()

try:
    model = joblib.load("model/svd_model.pkl")
except:
    model = None

@app.get("/predict")
def predict(user_id: str = Query(...), property_id: int = Query(...)):
    if not model:
        return {"error": "Modelo no entrenado aún"}
    try:
        pred = model.predict(user_id, property_id)
        return round(pred.est, 3)
    except Exception:
        return 0.0

@app.post("/train")
def train_model():
    try:
        mensaje = entrenar_modelo()
        global model
        model = joblib.load("model/svd_model.pkl") 
        return {"message": mensaje}
    except Exception as e:
        return {"error": str(e)}