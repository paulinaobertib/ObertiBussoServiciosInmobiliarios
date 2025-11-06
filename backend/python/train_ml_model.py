# train_ml_model.py
import os
from urllib.parse import quote_plus
import joblib
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from surprise import Dataset, Reader, SVD, accuracy
from surprise.model_selection import train_test_split, GridSearchCV

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

    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}?charset=utf8mb4"

def main():
    #  Conectar a la base
    db_url = get_db_url()
    print("DB URL (redacted):", redact_password_in_url(db_url))
    engine = create_engine(db_url)

    # Traer datos con pesos distintos (vistas 0.6, favoritos 1.0)
    query = """
    SELECT user_id, property_id, 0.6 AS rating FROM User_View
    UNION ALL
    SELECT user_id, property_id, 1.0 AS rating FROM Favorite
    """
    df = pd.read_sql(query, engine)

    if df.empty:
        raise RuntimeError("No hay datos en User_View o Favorite para entrenar el modelo.")

    # Filtrar usuarios con pocas interacciones
    df = df.groupby("user_id").filter(lambda x: len(x) >= 3)
    if df.empty:
        raise RuntimeError("No hay suficientes usuarios activos para entrenar el modelo.")

    print(f"Total de registros: {len(df)} | Usuarios únicos: {df['user_id'].nunique()}")

    # Crear dataset para Surprise
    reader = Reader(rating_scale=(0, 1))
    data = Dataset.load_from_df(df[['user_id', 'property_id', 'rating']], reader)
    trainset, testset = train_test_split(data, test_size=0.2)

    # Buscar mejores hiperparámetros
    print("Buscando mejores hiperparámetros...")
    param_grid = {
        'n_factors': [50, 100],
        'n_epochs': [20, 40],
        'lr_all': [0.002, 0.005],
        'reg_all': [0.02, 0.05]
    }

    gs = GridSearchCV(SVD, param_grid, measures=['rmse'], cv=3, n_jobs=-1)
    gs.fit(data)

    best_params = gs.best_params['rmse']
    print(f"Mejores parámetros encontrados: {best_params}")

    # Entrenar modelo final
    best_model = SVD(**best_params)
    best_model.fit(trainset)

    # Evaluar modelo
    predictions = best_model.test(testset)
    rmse = accuracy.rmse(predictions, verbose=False)
    mae = accuracy.mae(predictions, verbose=False)
    print(f"📊 Evaluación final:\n - RMSE: {rmse:.4f}\n - MAE: {mae:.4f}")

    # Guardar modelo entrenado
    os.makedirs("model", exist_ok=True)
    joblib.dump(best_model, "model/svd_model.pkl")
    print("💾 Modelo entrenado guardado en 'model/svd_model.pkl'")

    # Guardar métricas en un log
    with open("model/training_metrics.txt", "a") as f:
        f.write(f"RMSE={rmse:.4f}, MAE={mae:.4f}, registros={len(df)}\n")

    print("📁 Métricas guardadas en 'model/training_metrics.txt'")

if __name__ == "__main__":
    main()