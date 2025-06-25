#!/bin/bash

# Development helper script
echo "🔧 AI Queue Management System - Development Helper"
echo ""

case "$1" in
  "logs")
    if [ -z "$2" ]; then
      echo "📋 Showing logs for all services..."
      docker-compose logs -f
    else
      echo "📋 Showing logs for $2..."
      docker-compose logs -f "$2"
    fi
    ;;
  "restart")
    if [ -z "$2" ]; then
      echo "🔄 Restarting all services..."
      docker-compose restart
    else
      echo "🔄 Restarting $2..."
      docker-compose restart "$2"
    fi
    ;;
  "shell")
    if [ -z "$2" ]; then
      echo "🐚 Opening shell in devcontainer..."
      docker-compose exec devcontainer /bin/zsh
    else
      echo "🐚 Opening shell in $2..."
      docker-compose exec "$2" /bin/sh
    fi
    ;;
  "status")
    echo "📊 Service Status:"
    docker-compose ps
    ;;
  "install")
    echo "📦 Installing dependencies in all apps..."
    docker-compose exec queue-management-api bun install
    docker-compose exec mock-iot-api bun install
    docker-compose exec dashboard bun install
    ;;
  "clean")
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down
    docker system prune -f
    ;;
  *)
    echo "Usage: $0 {logs|restart|shell|status|install|clean} [service-name]"
    echo ""
    echo "Commands:"
    echo "  logs [service]     - Show logs for all services or specific service"
    echo "  restart [service]  - Restart all services or specific service"
    echo "  shell [service]    - Open shell in devcontainer or specific service"
    echo "  status            - Show status of all services"
    echo "  install           - Install dependencies in all services"
    echo "  clean             - Clean up Docker resources"
    echo ""
    echo "Services: devcontainer, queue-management-api, mock-iot-api, dashboard"
    ;;
esac
