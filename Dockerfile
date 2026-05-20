# Lightweight runtime — uses pre-computed predictions, no torch/lightgbm needed.
# Image drops from ~500 MB to ~150 MB, runtime memory drops from ~1 GB to ~300 MB.
FROM python:3.11-slim

WORKDIR /app

COPY streamlit_demo/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY streamlit_demo/app.py            /app/app.py
COPY streamlit_demo/data/             /app/data/
COPY streamlit_demo/models/           /app/models/

EXPOSE 8501

CMD ["streamlit", "run", "/app/app.py", \
     "--server.port=8501", \
     "--server.address=0.0.0.0", \
     "--server.headless=true", \
     "--server.enableCORS=false", \
     "--server.enableXsrfProtection=false", \
     "--server.enableWebsocketCompression=false", \
     "--browser.gatherUsageStats=false"]
