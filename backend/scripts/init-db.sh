#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready on $DB_HOST:$DB_PORT..."

while ! nc -z "$DB_HOST" "$DB_PORT"; do
  echo "Postgres is not ready yet..."
  sleep 2
done

echo "PostgreSQL is ready."

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
node src/server.js
