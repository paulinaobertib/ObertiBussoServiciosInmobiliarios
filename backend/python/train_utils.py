import pandas as pd
from sqlalchemy import create_engine
from surprise import Dataset, Reader, SVD, accuracy
import joblib
import os
from urllib.parse import quote_plus

def get_db_url():
    user = os.getenv("DB_SQL_USERNAME", "root")
    password = quote_plus(os.getenv("DB_SQL_PASSWORD", "")) 
    host = os.getenv("DB_SQL_HOST", "localhost")
    port = os.getenv("DB_SQL_PORT", "3306")
    name = os.getenv("DB_SQL_NAME_PROD", "obertibussoserviciosinmobiliarios")

    suffix = f"?sslMode=REQUIRED&serverTimezone=UTC"

    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}{suffix}"

def entrenar_modelo():
    engine = create_engine(get_db_url())

    query = """
    SELECT user_id, property_id, 1 AS rating
    FROM User_View
    UNION
    SELECT user_id, property_id, 1 AS rating
    FROM Favorite
    """
    df = pd.read_sql(query, engine)

    reader = Reader(rating_scale=(0, 1))
    data = Dataset.load_from_df(df[['user_id', 'property_id', 'rating']], reader)
    trainset = data.build_full_trainset()

    model = SVD()
    model.fit(trainset)

    os.makedirs("model", exist_ok=True)
    joblib.dump(model, "model/svd_model.pkl")

    return "Modelo entrenado correctamente"