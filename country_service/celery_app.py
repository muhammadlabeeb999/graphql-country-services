import os
from celery import Celery
from celery.schedules import crontab

REDIS = os.getenv('REDIS_URL', 'redis://redis:6379/0')

celery = Celery('countries', broker=os.getenv('CELERY_BROKER_URL', REDIS), backend=os.getenv('CELERY_RESULT_BACKEND', REDIS))
celery.conf.timezone = 'UTC'
celery.conf.broker_connection_retry_on_startup = True

# configure beat schedule: daily ingestion at 00:00 UTC (change as needed)
celery.conf.beat_schedule = {
    'ingest-countries-daily': {
        'task': 'tasks.ingest_countries',
        'schedule': crontab(minute='*/2'),
    }
}

# make sure tasks are discovered when this module is imported
celery.autodiscover_tasks(['tasks'])
