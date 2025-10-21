FROM python:3.9-slim-bullseye

WORKDIR /app

RUN apt-get update \
 && apt-get install -y build-essential python3-dev libffi-dev libblas-dev liblapack-dev gfortran \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel \
 && pip install "numpy<2.0.0" \
 && pip install --no-cache-dir -r requirements.txt

COPY main.py train_ml_model.py train_utils.py ./
COPY model/ model/

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]