#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready on $DB_HOST:$DB_PORT..."

MAX_RETRIES=30
COUNTER=0

while ! nc -z "$DB_HOST" "$DB_PORT"; do
  COUNTER=$((COUNTER + 1))
  echo "Postgres is not ready yet... (attempt $COUNTER/$MAX_RETRIES)"
  if [ "$COUNTER" -ge "$MAX_RETRIES" ]; then
    echo "Postgres did not become ready in time. Continuing anyway."
    break
  fi
  sleep 2
done

echo "PostgreSQL wait loop finished."

DB_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

echo "Running migrations..."
for file in /app/migrations/*.sql; do
  echo "Running $file"
  psql "$DB_URL" -f "$file"
done

echo "Running seed data..."
psql "$DB_URL" -f /app/seeds/seed_data.sql

echo "Database initialization completed."

echo "Starting backend server..."
exec node src/server.js
