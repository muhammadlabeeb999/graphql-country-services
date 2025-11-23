import graphene
from graphene_sqlalchemy import SQLAlchemyObjectType
from models import Country as CountryModel
from database import get_db_session
from sqlalchemy import func

class CountryType(SQLAlchemyObjectType):
    class Meta:
        model = CountryModel

    id = graphene.String(source='id')

class CountryInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    alpha2_code = graphene.String(required=True)
    alpha3_code = graphene.String()
    capital = graphene.String()
    region = graphene.String()
    subregion = graphene.String()
    population = graphene.Int()
    area_km2 = graphene.Float()
    latitude = graphene.Float()
    longitude = graphene.Float()
    flag_url = graphene.String()
    timezones = graphene.JSONString()
    currencies = graphene.JSONString()
    languages = graphene.JSONString()

class Query(graphene.ObjectType):
    country = graphene.Field(CountryType, name=graphene.String(), alpha2_code=graphene.String())
    countries = graphene.List(CountryType, limit=graphene.Int(default_value=10), offset=graphene.Int(default_value=0))
    countries_near = graphene.List(
        CountryType,
        latitude=graphene.Float(required=True),
        longitude=graphene.Float(required=True),
        radius_km=graphene.Float(default_value=500.0),
        limit=graphene.Int(default_value=10),
    )

    def resolve_country(self, info, name=None, alpha2_code=None):
        db = get_db_session()
        q = db.query(CountryModel)
        if name:
            return q.filter(CountryModel.name.ilike(name)).first()
        if alpha2_code:
            return q.filter(CountryModel.alpha2_code == alpha2_code.upper()).first()
        return None

    def resolve_countries(self, info, limit, offset):
        db = get_db_session()
        return db.query(CountryModel).order_by(CountryModel.name).offset(offset).limit(limit).all()

    def resolve_countries_near(self, info, latitude, longitude, radius_km, limit):
        db = get_db_session()
        # Haversine formula components in SQL
        lat_col = func.radians(CountryModel.latitude)
        lon_col = func.radians(CountryModel.longitude)
        lat2 = func.radians(latitude)
        lon2 = func.radians(longitude)

        dlat = lat_col - lat2
        dlon = lon_col - lon2
        a = func.sin(dlat/2) * func.sin(dlat/2) + func.cos(lat2) * func.cos(lat_col) * func.sin(dlon/2) * func.sin(dlon/2)
        c = 2 * func.atan2(func.sqrt(a), func.sqrt(1 - a))
        earth_km = 6371.0
        distance_km = earth_km * c

        # Query countries with non-null coordinates
        q = db.query(CountryModel).filter(CountryModel.latitude.isnot(None), CountryModel.longitude.isnot(None))
        # Attach distance and filter by radius
        q = q.add_columns(distance_km.label('distance_km')).filter(distance_km <= radius_km).order_by('distance_km').limit(limit)
        results = q.all()
        return [r[0] for r in results]

class AddCountry(graphene.Mutation):
    class Arguments:
        country_data = CountryInput(required=True)

    ok = graphene.Boolean()
    country = graphene.Field(lambda: CountryType)

    def mutate(self, info, country_data=None):
        db = get_db_session()
        alpha2_code = country_data.alpha2_code.upper()
        # prevent ingestion overwriting manual: set source='manual'
        country = CountryModel(
            name=country_data.name,
            alpha2_code=alpha2_code,
            alpha3_code=country_data.alpha3_code,
            capital=country_data.capital,
            region=country_data.region,
            subregion=country_data.subregion,
            population=country_data.population,
            area_km2=country_data.area_km2,
            latitude=country_data.latitude,
            longitude=country_data.longitude,
            flag_url=country_data.flag_url,
            timezones=country_data.timezones,
            currencies=country_data.currencies,
            languages=country_data.languages,
            source='manual',
        )
        db.add(country)
        db.commit()
        # trigger notification via Celery task (import here to avoid circular)
        try:
            from tasks import notify_country_added
            notify_country_added.delay(str(country.id), country.name)
        except Exception:
            # ensure mutation still succeeds even if task publish fails
            pass
        return AddCountry(ok=True, country=country)

class Mutation(graphene.ObjectType):
    add_country = AddCountry.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
