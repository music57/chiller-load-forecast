# Root-level Dockerfile so Zeabur auto-detects it.
# Builds the Streamlit demo (streamlit_demo/app.py).
FROM python:3.11-slim

WORKDIR /app

# LightGBM needs libgomp (OpenMP runtime)
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
 && rm -rf /var/lib/apt/lists/*

# CPU-only torch first (skip 2GB+ NVIDIA CUDA packages)
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch==2.4.1

# Project-level src module imported by the app
COPY src/ /app/src/

# Demo files (data + trained models + the streamlit app)
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
     "--browser.gatherUsageStats=false"]
