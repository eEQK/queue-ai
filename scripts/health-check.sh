#!/bin/bash

echo "🏥 Health Check - AI Queue Management System"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $service_name... "
    
    if command -v curl >/dev/null 2>&1; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
        if [ "$response" = "$expected_status" ]; then
            echo -e "${GREEN}✅ Healthy${NC}"
            return 0
        else
            echo -e "${RED}❌ Unhealthy (HTTP $response)${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  curl not available${NC}"
        return 1
    fi
}

# Check if Docker Compose is running
echo "Checking Docker services..."
if ! docker-compose ps >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose not running${NC}"
    echo "Run: ./scripts/start.sh"
    exit 1
fi

# Show container status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🔍 Service Health Checks:"

# Check each service
check_service "Queue Management API" "http://localhost:3000" "200"
check_service "Mock IoT API" "http://localhost:3001" "200" 
check_service "Dashboard" "http://localhost:5173" "200"

echo ""
echo "📋 Quick Links:"
echo "• Dashboard: http://localhost:5173"
echo "• Queue API: http://localhost:3000" 
echo "• IoT API: http://localhost:3001"

echo ""
echo "🔧 Troubleshooting:"
echo "• View logs: ./scripts/dev.sh logs [service]"
echo "• Restart: ./scripts/dev.sh restart [service]"
echo "• Shell access: ./scripts/dev.sh shell [service]"
