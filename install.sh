#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.yml"
API_SERVICE="country-service"

# check if env file is present
if [ ! -f ".env" ]; then
  echo "ERROR: .env file missing."
  echo "Please create it first:"
  echo "    cp .env.sample .env"
  echo "Then fill in the required variables."
  exit 1
fi

# load env variables
echo "env file found"
echo "Loading environment..."
source .env

# build and run the containers
echo "Building and starting containers..."
docker compose -f "${COMPOSE_FILE}" up --build -d

# run db migrations
echo "Running DB migrations (alembic upgrade head)..."
docker compose -f "${COMPOSE_FILE}" run --rm "${API_SERVICE}" alembic upgrade head

# show useful commands
echo ""
echo "Installation complete!"
echo "Useful commands:"
echo "  View all logs: docker compose -f ${COMPOSE_FILE} logs -f"
echo "  View country-service logs: docker compose -f ${COMPOSE_FILE} logs -f ${API_SERVICE}"
echo "  View notification-service logs: docker compose -f ${COMPOSE_FILE} logs -f notification-service"
echo "  Run country-service tests: docker compose -f ${COMPOSE_FILE} run --rm ${API_SERVICE} pytest -q tests/"
echo "  Run notification-service tests: docker compose -f ${COMPOSE_FILE} run --rm notification-service pytest -q tests/"
echo ""
echo "GraphQL endpoint: http://localhost:8000/graphql"
echo "Frontend demo: http://localhost:3000 (if frontend served)"
echo "Notifier health: http://localhost:8020/health"
