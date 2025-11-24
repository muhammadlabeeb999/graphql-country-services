import os
from celery import Celery
from celery.schedules import crontab

REDIS = os.getenv('REDIS_URL', 'redis://redis:6379/0')

celery = Celery('countries', broker=os.getenv('CELERY_BROKER_URL', REDIS), backend=os.getenv('CELERY_RESULT_BACKEND', REDIS))
celery.conf.timezone = 'UTC'
celery.conf.broker_connection_retry_on_startup = True

# Parse cron values from environment variables
def get_cron_value(name, default):
    val = os.getenv(name, default).strip()
    if not val:
        return default
    return val

# Get cron values from environment variables
minute = get_cron_value("INGEST_MINUTE", "0")
hour = get_cron_value("INGEST_HOUR", "*")

# Configure beat schedule: ingestion job
celery.conf.beat_schedule = {
    'ingest-countries-daily': {
        'task': 'tasks.ingest_countries',
        'schedule': crontab(minute=minute, hour=hour),
    }
}

# make sure tasks are discovered when this module is imported
celery.autodiscover_tasks(['tasks'])
