FROM python:3.11-slim
WORKDIR /app

# system deps for psycopg2 and build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app
ENV PYTHONUNBUFFERED=1

# Create a non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# default command runs gunicorn (api) — in compose we use different commands for worker/beat
CMD ["gunicorn", "app:app", "-b", "0.0.0.0:8000", "--workers", "1"]
