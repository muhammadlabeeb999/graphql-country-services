import os
import sys

# Add parent directory to path to allow importing app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# simple test DB using sqlite in-memory for unit tests; for integration, use a Postgres test container
TEST_DATABASE_URL = os.getenv('TEST_DATABASE_URL', 'sqlite:///:memory:')

@pytest.fixture(scope='session')
def engine():
    return create_engine(TEST_DATABASE_URL)

@pytest.fixture(scope='function')
def db_session(engine):
    # create tables
    from models import Base
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)
