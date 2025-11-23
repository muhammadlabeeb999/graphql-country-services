import schema

def test_add_country_mutation(db_session, monkeypatch):
    import schema as s
    monkeypatch.setattr(s, 'get_db_session', lambda: db_session)

    # Use correct field names: alpha2Code instead of iso2
    # Pass JSON strings for JSON fields
    mutation = '''
    mutation { 
        addCountry(countryData: {
            name: "Newland", 
            alpha2Code: "NL", 
            currencies: "{\\"NLD\\": {\\"name\\": \\"New Dollar\\"}}"
        }) { 
            ok 
            country { 
                name 
                alpha2Code 
                currencies
            } 
        } 
    }
    '''
    result = schema.schema.execute(mutation)
    assert not result.errors
    assert result.data['addCountry']['ok'] is True
    assert result.data['addCountry']['country']['alpha2Code'] == 'NL'
    assert 'New Dollar' in result.data['addCountry']['country']['currencies']
