# train_ml_model.py
import pandas as pd
from sqlalchemy import create_engine
from surprise import Dataset, Reader, SVD, accuracy
from surprise.model_selection import train_test_split
import joblib
import os

# 1. Conexión a tu base de datos
engine = create_engine('mysql+pymysql://root:lmcpauli1@localhost:3306/obertibussoserviciosinmobiliarios')

query = """
SELECT user_id, property_id, 1 AS rating
FROM User_View
UNION
SELECT user_id, property_id, 1 AS rating
FROM Favorite
"""
df = pd.read_sql(query, engine)

# 2. Preparar datos para Surprise
reader = Reader(rating_scale=(0, 1))
data = Dataset.load_from_df(df[['user_id', 'property_id', 'rating']], reader)

# 3. Dividir en conjunto entrenamiento y prueba (80/20)
trainset, testset = train_test_split(data, test_size=0.2)

# 4. Entrenar modelo SVD con conjunto de entrenamiento
model = SVD()
model.fit(trainset)

# 5. Evaluar modelo con conjunto de prueba
predictions = model.test(testset)
rmse = accuracy.rmse(predictions)
mae = accuracy.mae(predictions)
print(f"Evaluación del modelo:\n - RMSE: {rmse:.4f}\n - MAE: {mae:.4f}")

# 6. Guardar modelo entrenado
# Crear carpeta "model" si no existe
os.makedirs("model", exist_ok=True)
joblib.dump(model, "model/svd_model.pkl")
print("Modelo entrenado y guardado en 'model/svd_model.pkl'")
