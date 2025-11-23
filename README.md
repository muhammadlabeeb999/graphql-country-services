# UST Task - Country & Notification Service

A microservices-based application for managing country data and sending notifications.

## Prerequisites

- Docker & Docker Compose (see [official Docker documentation](https://docs.docker.com/get-docker/))
- Git (see [official Git documentation](https://git-scm.com/))

## Installation

### Linux / macOS

We provide a convenience script to set up the environment, build containers, and run migrations.

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

### Useful Commands

```bash
# View logs
docker compose logs -f

# Run Tests (Country Service)
docker compose run --rm country-service pytest -q tests/

# Run Tests (Notification Service)
docker compose run --rm notification-service pytest -q tests/
```
