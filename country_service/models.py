import uuid
from sqlalchemy import Column, String, Integer, Float, JSON, DateTime, func
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type on the backend, but falls back to CHAR(36)
    for SQLite.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            return value

class Country(Base):
    __tablename__ = 'countries'
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    alpha2_code = Column(String(2), unique=True, index=True)
    alpha3_code = Column(String(3), unique=True, index=True)
    capital = Column(String)
    region = Column(String)
    subregion = Column(String)
    population = Column(Integer)
    area_km2 = Column(Float)
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    timezones = Column(JSON)
    currencies = Column(JSON)
    languages = Column(JSON)
    flag_url = Column(String)
    source = Column(String, nullable=False, default='external')
    synced_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'alpha2_code': self.alpha2_code,
            'alpha3_code': self.alpha3_code,
            'capital': self.capital,
            'region': self.region,
            'subregion': self.subregion,
            'population': self.population,
            'area_km2': self.area_km2,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'timezones': self.timezones,
            'currencies': self.currencies,
            'languages': self.languages,
            'flag_url': self.flag_url,
            'source': self.source,
        }
