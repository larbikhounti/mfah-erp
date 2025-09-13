#!/bin/sh

echo "Starting backend application..."

# Wait for database to be ready
echo "Waiting for database connection..."
until npx prisma db push 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
npx prisma db push

# Run database seeding
echo "Running database seeding..."
npx prisma db seed

echo "Starting the application..."
exec "$@"