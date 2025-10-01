# train_ml_model.py
import os
from urllib.parse import quote_plus

import joblib
import pandas as pd
from sqlalchemy import create_engine
from surprise import Dataset, Reader, SVD, accuracy
from surprise.model_selection import train_test_split

from sqlalchemy.engine.url import make_url

def redact_password_in_url(url: str) -> str:
    """Devuelve la URL con la contraseña oculta (***)."""
    try:
        u = make_url(url)
        return str(u.set(password="***"))
    except Exception:
        import re
        return re.sub(r'(://[^:]+:)[^@]+@', r'\1***@', url)

def get_db_url():
    user = os.getenv("DB_SQL_USERNAME", "root")
    password = quote_plus(os.getenv("DB_SQL_PASSWORD", ""))
    host = os.getenv("DB_SQL_HOST", "localhost")
    port = os.getenv("DB_SQL_PORT", "3306")
    name = os.getenv("DB_SQL_NAME_PROD", "obertibussoserviciosinmobiliarios")

    # SIN sslMode / serverTimezone (eso es de JDBC)
    # Podés dejar solo la base, o sumar algo neutro como charset:
    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}?charset=utf8mb4"

def main():
    # 1) Conexión a tu base de datos
    db_url = get_db_url()
    print("DB URL (redacted):", redact_password_in_url(db_url))
    engine = create_engine(db_url)

    # 2) Query de interacciones - Preparar datos para Surprise
    query = """
    SELECT user_id, property_id, 1 AS rating FROM User_View
    UNION
    SELECT user_id, property_id, 1 AS rating FROM Favorite
    """
    df = pd.read_sql(query, engine)

    if df.empty:
        raise RuntimeError("No hay datos para entrenar (User_View / Favorite vacías).")

    # 3) Dividir en conjunto entrenamiento y prueba (80/20)
    reader = Reader(rating_scale=(0, 1))
    data = Dataset.load_from_df(df[['user_id', 'property_id', 'rating']], reader)
    trainset, testset = train_test_split(data, test_size=0.2)

    # 4) Entrenar modelo SVD con conjunto de entrenamiento
    model = SVD()
    model.fit(trainset)

    # 5) Evaluar modelo con conjunto de prueba
    predictions = model.test(testset)
    rmse = accuracy.rmse(predictions, verbose=False)
    mae = accuracy.mae(predictions, verbose=False)
    print(f"Evaluación del modelo:\n - RMSE: {rmse:.4f}\n - MAE: {mae:.4f}")

    # 6) Guardar modelo entrenado
    os.makedirs("model", exist_ok=True)
    joblib.dump(model, "model/svd_model.pkl")
    print("Modelo entrenado y guardado en 'model/svd_model.pkl'")


if __name__ == "__main__":
    main()