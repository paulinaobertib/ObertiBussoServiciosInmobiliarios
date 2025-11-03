import os
from urllib.parse import quote_plus
import pandas as pd
import joblib
from sqlalchemy import create_engine
from surprise import Dataset, Reader, SVD, accuracy
from surprise.model_selection import GridSearchCV, train_test_split

def get_db_url():
    user = os.getenv("DB_SQL_USERNAME", "root")
    password = quote_plus(os.getenv("DB_SQL_PASSWORD", "lmcpauli1")) 
    host = os.getenv("DB_SQL_HOST", "localhost")
    port = os.getenv("DB_SQL_PORT", "3306")
    name = os.getenv("DB_SQL_NAME_PROD", "obertibussoserviciosinmobiliarios")
    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}?charset=utf8mb4"

def entrenar_modelo():
    # Conectarse a la base
    engine = create_engine(get_db_url())

    # Cargar datos de vistas y favoritos con pesos distintos
    query = """
    SELECT user_id, property_id, 0.6 AS rating FROM User_View
    UNION ALL
    SELECT user_id, property_id, 1.0 AS rating FROM Favorite
    """
    df = pd.read_sql(query, engine)

    if df.empty:
        raise RuntimeError("No hay datos en User_View o Favorite para entrenar el modelo.")

    # Filtrar usuarios con pocas interacciones (menos de 3)
    df = df.groupby("user_id").filter(lambda x: len(x) >= 3)

    if df.empty:
        raise RuntimeError("No hay suficientes usuarios activos para entrenar el modelo.")

    # Crear dataset de Surprise
    reader = Reader(rating_scale=(0, 1))
    data = Dataset.load_from_df(df[['user_id', 'property_id', 'rating']], reader)

    # Dividir en entrenamiento y prueba (80/20)
    trainset, testset = train_test_split(data, test_size=0.2)

    # Búsqueda de mejores hiperparámetros
    param_grid = {
        'n_factors': [50, 100],
        'n_epochs': [20, 40],
        'lr_all': [0.002, 0.005],
        'reg_all': [0.02, 0.05]
    }

    print("Buscando mejores hiperparámetros...")
    gs = GridSearchCV(SVD, param_grid, measures=['rmse', 'mae'], cv=3, n_jobs=-1)
    gs.fit(data)

    best_params = gs.best_params['rmse']
    print(f"Mejores parámetros encontrados: {best_params}")

    # Entrenar modelo final con los mejores parámetros
    best_model = SVD(**best_params)
    best_model.fit(trainset)

    # Evaluar en conjunto de prueba
    predictions = best_model.test(testset)
    rmse = accuracy.rmse(predictions, verbose=False)
    mae = accuracy.mae(predictions, verbose=False)

    print(f"Evaluación final del modelo: RMSE={rmse:.4f}, MAE={mae:.4f}")

    # Guardar el modelo
    os.makedirs("model", exist_ok=True)
    joblib.dump(best_model, "model/svd_model.pkl")

    return f"Modelo entrenado correctamente. RMSE={rmse:.4f}, MAE={mae:.4f}"
