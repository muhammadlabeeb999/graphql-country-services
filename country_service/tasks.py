import os
import json
import requests
from celery_app import celery
from database import get_db_session
from models import Country as CountryModel
from datetime import datetime

API_URL = os.getenv('API_COUNTRIES_URL', 'https://www.apicountries.com/countries')

@celery.task(bind=True, name='tasks.ingest_countries')
def ingest_countries(self):
    """
    Periodic task: fetch country list from external API and upsert into DB.
    Only updates rows where source == 'external' or creates new rows.
    """
    db = get_db_session()
    try:
        try:
            resp = requests.get(API_URL, timeout=30)
            resp.raise_for_status()
            countries = resp.json()
        except Exception as e:
            print('Failed to fetch countries:', e)
            return 0

        count = 0
        for item in countries:
            alpha2_code = (item.get('alpha2Code') or '').upper()
            if not alpha2_code:
                continue
            existing = db.query(CountryModel).filter(CountryModel.alpha2_code == alpha2_code).first()
            if existing:
                if existing.source == 'external':
                    existing.name = item.get('name') or existing.name
                    existing.alpha3_code = item.get('alpha3Code') or existing.alpha3_code
                    existing.capital = item.get('capital') or existing.capital
                    existing.region = item.get('region') or existing.region
                    existing.subregion = item.get('subregion') or existing.subregion
                    existing.population = item.get('population') or existing.population
                    existing.area_km2 = item.get('area') or existing.area_km2
                    existing.latitude = (item.get('latlng')[0] if item.get('latlng') and len(item.get('latlng')) > 0 else None) or existing.latitude
                    existing.longitude = (item.get('latlng')[1] if item.get('latlng') and len(item.get('latlng')) > 1 else None) or existing.longitude
                    existing.timezones = item.get('timezones') or existing.timezones
                    existing.currencies = item.get('currencies') or existing.currencies
                    existing.languages = item.get('languages') or existing.languages
                    existing.flag_url = item.get('flag') or existing.flag_url
                    existing.synced_at = datetime.utcnow()
                    db.add(existing)
            else:
                country = CountryModel(
                    name=item.get('name'),
                    alpha2_code=alpha2_code,
                    alpha3_code=item.get('alpha3Code'),
                    capital=item.get('capital'),
                    region=item.get('region'),
                    subregion=item.get('subregion'),
                    population=item.get('population'),
                    area_km2=item.get('area'),
                    latitude=(item.get('latlng')[0] if item.get('latlng') and len(item.get('latlng')) > 0 else None),
                    longitude=(item.get('latlng')[1] if item.get('latlng') and len(item.get('latlng')) > 1 else None),
                    timezones=item.get('timezones'),
                    currencies=item.get('currencies'),
                    languages=item.get('languages'),
                    flag_url=item.get('flag'),
                    source='external',
                )
                db.add(country)
            count += 1
        db.commit()
        return count
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

@celery.task(bind=True, name='tasks.notify_country_added')
def notify_country_added(self, country_id: str, country_name: str):
    """Publish a small event to Redis pubsub channel 'country_events' for notifier to pick up."""
    import redis
    import os
    r = redis.from_url(os.getenv('REDIS_URL', 'redis://redis:6379/0'))
    payload = json.dumps({'event': 'country_added', 'id': str(country_id), 'name': country_name})
    r.publish('country_events', payload)
    return True
