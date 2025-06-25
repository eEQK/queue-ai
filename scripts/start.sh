#!/bin/bash

# Build and start all services
echo "🚀 Starting AI Queue Management System..."

# Build all Docker images
echo "📦 Building Docker images..."
docker-compose build

# Start all services
echo "🔄 Starting services..."
docker-compose up -d

# Wait a moment for services to start
sleep 5

# Check service health
echo "🔍 Checking service health..."
echo "Queue Management API: http://localhost:3000"
echo "Mock IoT API: http://localhost:3001"
echo "Dashboard: http://localhost:5173"

# Show running containers
docker-compose ps

echo "✅ All services are starting up!"
echo "📊 Dashboard will be available at: http://localhost:5173"
echo "🔧 API documentation at: http://localhost:3000"
echo ""
echo "To view logs: docker-compose logs -f [service-name]"
echo "To stop: docker-compose down"
