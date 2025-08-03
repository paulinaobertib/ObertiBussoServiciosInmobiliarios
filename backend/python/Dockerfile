FROM python:3.11.10-slim-bookworm

WORKDIR /app

RUN apt-get update \
 && apt-get upgrade -y \
 && apt-get install -y build-essential \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py train_ml_model.py ./
COPY model/ model/

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
