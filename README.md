# GraphQL - Country & Notification Service

A microservices-based application for managing country data and sending notifications.

## Prerequisites

- Docker & Docker Compose (see [official Docker documentation](https://docs.docker.com/get-docker/))
- Git (see [official Git documentation](https://git-scm.com/))

## Installation

### Linux / macOS

A convenience script is provided to set up the environment, build containers, and run migrations.

```bash
# 1. Create .env file
cp .env.sample .env
# (Edit .env with your credentials if needed)

# 2. Run installer
chmod +x install.sh
./install.sh
```

### Windows (PowerShell)

For Windows users, run the following commands in PowerShell:

```powershell
# 1. Create .env file
Copy-Item .env.sample .env
# (Open .env in a text editor and fill in required variables)

# 2. Build and start containers
docker compose up --build -d

# 3. Run DB migrations
docker compose run --rm country-service alembic upgrade head
```

## Usage

- **GraphQL Playground**: [http://localhost:8000/graphql](http://localhost:8000/graphql)
- **Notification Service Health**: [http://localhost:8020/health](http://localhost:8020/health)
- **Frontend Application**: [http://localhost:8080](http://localhost:8080)

## Testing Options

You have two options to test the queries:

1.  **Frontend**: A React-based frontend is available to interact with the services at [http://localhost:8080](http://localhost:8080).
2.  **GraphQL Playground**: You can directly test queries at [http://localhost:8000/graphql](http://localhost:8000/graphql).

### Sample Queries

Here are some working queries you can use in the GraphQL Playground:

#### Get Countries (with pagination)
```graphql
query Countries($limit: Int = 10, $offset: Int = 0) {
  countries(limit: $limit, offset: $offset) {
    id
    name
    alpha2Code
    alpha3Code
    capital
    region
    subregion
    population
    areaKm2
    latitude
    longitude
    timezones
    currencies
    languages
    flagUrl  
  }
}
```

#### Get Country by Name

> **Tip**: You can also query by **Alpha-2 Code**! To do so, update both the variable definition (e.g., `$alpha2Code: String = "IN"`) and the argument (e.g., `country(alpha2Code: $alpha2Code)`).

```graphql
query Country($name: String = "India"){
  country(name: $name){
    id
    name
    alpha2Code
    alpha3Code
    capital
    region
    subregion
    population
    areaKm2
    latitude
    longitude
    timezones
    currencies
    languages
    flagUrl
  }
}
```

#### Add Country
```graphql
mutation {
  addCountry(countryData: {
    name: "New Country",
    alpha2Code: "ZX",
    alpha3Code: "NCC",
    capital: "New Country Capital",
    region: "New",
    subregion: "South New",
    population: 1000,
    areaKm2: 500,
    latitude: 10.0,
    longitude: 20.0,
    timezones: "[\"UTC\"]",
    currencies: "{\"WDL\": {\"name\": \"Wonder Dollar\", \"symbol\": \"$\"}}",
    languages: "{\"eng\": \"English\"}"
  }) {
    ok
    country {
      id
      name
    }
  }
}
```

#### Get Countries Near Location

> **Note**: `radiusKm` (default: 500.0) and `limit` (default: 10) are optional.

```graphql
query CountriesNear($latitude: Float = 48.8566, $longitude: Float = 2.3522, $radiusKm: Float = 500.0, $limit: Int = 10) {
  countriesNear(latitude: $latitude, longitude: $longitude, radiusKm: $radiusKm, limit: $limit) {
    id
    name
    alpha2Code
    alpha3Code
    capital
    region
    subregion
    population
    areaKm2
    latitude
    longitude
    timezones
    currencies
    languages
    flagUrl
  }
}
```

### Field & Variable Descriptions

Common fields and variables used in the queries above:

-   **`name`**: Name of the country.
-   **`alpha2Code`**: ISO 3166-1 alpha-2 code (2-letter country code).
-   **`alpha3Code`**: ISO 3166-1 alpha-3 code (3-letter country code).
-   **`capital`**: Capital city of the country.
-   **`region`**: Continent or geographic region.
-   **`subregion`**: Geographic sub-region.
-   **`population`**: Total population count.
-   **`areaKm2`**: Total area in square kilometers.
-   **`latitude`**: Geographic latitude coordinate.
-   **`longitude`**: Geographic longitude coordinate.
-   **`timezones`**: List of timezones applicable to the country.
-   **`currencies`**: Currency information (JSON structure).
-   **`languages`**: Language information (JSON structure).
-   **`flagUrl`**: URL to the country's flag image.
-   **`limit`**: Number of results to return (for pagination).
-   **`offset`**: Number of results to skip (for pagination).
-   **`radiusKm`**: Search radius in kilometers (for location-based search).

### Testing

```bash
# Run Tests (Country Service)
docker compose run --rm country-service pytest -q tests/

# Run Tests (Notification Service)
docker compose run --rm notification-service pytest -q tests/
```

### Logs & Debugging

You can view logs for individual services or all services at once.

```bash
# View logs for all services (follow mode)
docker compose logs -f

# View logs for Country Service
docker compose logs -f country-service

# View logs for Notification Service
docker compose logs -f notification-service

# View logs for Frontend
docker compose logs -f frontend

# View logs for Celery Worker
docker compose logs -f worker

# View logs for Celery Beat
docker compose logs -f beat

# View logs for Database
docker compose logs -f db

# View logs for Redis
docker compose logs -f redis
```
