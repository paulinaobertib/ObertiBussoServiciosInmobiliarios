from fastapi import FastAPI, Query
import joblib
from train_utils import entrenar_modelo

app = FastAPI()

# Cargar modelo si existe
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
        return {"prediction": round(pred.est, 3)}
    except Exception as e:
        return {"error": f"Error al predecir: {str(e)}"}


@app.post("/train")
def train_model():
    global model
    try:
        mensaje = entrenar_modelo()
        model = joblib.load("model/svd_model.pkl") 
        return {"message": mensaje}
    except Exception as e:
        return {"error": str(e)}