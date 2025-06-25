#!/bin/bash

# Stop all services
echo "🛑 Stopping AI Queue Management System..."
docker-compose down

# Remove volumes (optional - uncomment if you want to reset data)
# docker-compose down -v

echo "✅ All services stopped!"
