from tasks import ingest_countries
import json

def test_ingest_happy_path(db_session, monkeypatch):
    # mock requests.get to return sample payload matching API structure
    sample = [
        {
            "name": "Mockland", 
            "alpha2Code": "MK", 
            "alpha3Code": "MCK", 
            "capital": "Mock City", 
            "latlng": [10.0, 20.0]
        }
    ]
    class DummyResp:
        def raise_for_status(self):
            pass
        def json(self):
            return sample
    monkeypatch.setattr('tasks.requests.get', lambda *a, **k: DummyResp())
    
    # Patch get_db_session in tasks to use our test session
    import tasks
    monkeypatch.setattr(tasks, 'get_db_session', lambda: db_session)

    # run task synchronously
    count = ingest_countries()
    assert count >= 1
    
    from models import Country
    c = db_session.query(Country).filter_by(alpha2_code='MK').first()
    assert c is not None
    assert c.name == 'Mockland'
    assert c.latitude == 10.0
    assert c.longitude == 20.0
