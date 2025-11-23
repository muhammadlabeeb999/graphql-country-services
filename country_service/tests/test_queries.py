from schema import schema
from models import Country as CountryModel

def test_country_query_simple(db_session, monkeypatch):
    # create a country record
    c = CountryModel(name='Testland', alpha2_code='TL', alpha3_code='TES')
    db_session.add(c)
    db_session.commit()

    # patch get_db_session to use our test session
    import schema as s
    monkeypatch.setattr(s, 'get_db_session', lambda: db_session)

    query = '''query { countries(limit:1, offset:0) { name alpha2Code } }'''
    result = schema.execute(query)
    assert not result.errors
    assert result.data['countries'][0]['alpha2Code'] == 'TL'

def test_country_single_query(db_session, monkeypatch):
    c = CountryModel(name='Single', alpha2_code='SG')
    db_session.add(c)
    db_session.commit()

    import schema as s
    monkeypatch.setattr(s, 'get_db_session', lambda: db_session)

    query = '''query { country(alpha2Code: "SG") { name } }'''
    result = schema.execute(query)
    assert not result.errors
    assert result.data['country']['name'] == 'Single'

def test_countries_near(db_session, monkeypatch):
    # Country at 10, 10
    c1 = CountryModel(name='Near', alpha2_code='NR', latitude=10.0, longitude=10.0)
    # Country far away
    c2 = CountryModel(name='Far', alpha2_code='FR', latitude=80.0, longitude=80.0)
    db_session.add(c1)
    db_session.add(c2)
    db_session.commit()

    import schema as s
    monkeypatch.setattr(s, 'get_db_session', lambda: db_session)

    # Search near 10, 10
    query = '''
    query {
        countriesNear(latitude: 10.0, longitude: 10.0, radiusKm: 500) {
            name
        }
    }
    '''
    result = schema.execute(query)
    assert not result.errors
    names = [x['name'] for x in result.data['countriesNear']]
    assert 'Near' in names
    assert 'Far' not in names
