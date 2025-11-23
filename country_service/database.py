import os
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker, declarative_base

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql+psycopg2://postgres:postgres@localhost:5432/ust')

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = scoped_session(sessionmaker(bind=engine))

Base = declarative_base()

def init_db():
    # Import models to ensure they are registered with Base.metadata
    import models
    Base.metadata.create_all(bind=engine)

def get_db_session():
    return SessionLocal()
