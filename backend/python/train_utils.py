import pandas as pd
from sqlalchemy import create_engine
from surprise import Dataset, Reader, SVD, accuracy
import joblib
import os

def entrenar_modelo():
    engine = create_engine('mysql+pymysql://root:lmcpauli1@localhost:3306/obertibussoserviciosinmobiliarios')

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