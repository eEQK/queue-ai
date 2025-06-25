# AI Queue Management System - Development Setup

This project provides **two separate approaches** for development:

## 🛠️ Development Approaches

### **Approach 1: VS Code DevContainer** (Recommended for Development)

**What it is**: A complete development environment in a container with all tools pre-installed.

**How it works**:
1. Open project in VS Code
2. VS Code detects `.devcontainer/devcontainer.json`
3. Click "Reopen in Container" 
4. VS Code builds a container with Bun, Node.js, extensions, etc.
5. Your source code is mounted into the container
6. You develop directly inside the container with full IDE support

**Benefits**:
- ✅ Consistent dev environment across team members
- ✅ All tools/extensions pre-configured
- ✅ No local setup required
- ✅ Full IntelliSense, debugging, etc.
- ✅ Isolated from your host machine

**Usage**:
```bash
# After opening in DevContainer:
bun install          # Install all dependencies
bun run dev          # Start all services locally
```

### **Approach 2: Docker Compose** (Production-like Services)

**What it is**: Separate containerized services that run independently.

**How it works**:
1. Each service (API, IoT, Dashboard) runs in its own container
2. Services communicate via Docker network
3. You develop on your host machine or in any environment
4. Services auto-reload when you change code

**Benefits**:
- ✅ Production-like environment
- ✅ Service isolation
- ✅ Network communication testing
- ✅ Easy scaling and deployment testing

**Usage**:
```bash
./scripts/start.sh       # Start all services
./scripts/health-check.sh # Check service health
./scripts/dev.sh logs    # View logs
./scripts/stop.sh        # Stop all services
```

## 🚀 Quick Start

### DevContainer Setup (Recommended)
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install [VS Code](https://code.visualstudio.com/) + [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Open this project in VS Code
4. Click "Reopen in Container" when prompted
5. Wait for container to build (first time only)
6. Run `bun run dev` in integrated terminal

### Docker Compose Setup
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Clone this repository
3. Run `./scripts/start.sh`
4. Visit http://localhost:5173 for the dashboard

## Available Scripts

### Root Package Scripts
```bash
# Development (local)
bun run dev              # Start all services locally
bun run install          # Install dependencies in all apps

# Docker commands
bun run docker:build     # Build Docker images
bun run docker:up        # Start services in Docker
bun run docker:down      # Stop Docker services
bun run docker:logs      # View logs
bun run docker:start     # Helper script to start everything
bun run docker:stop      # Helper script to stop everything
```

### Helper Scripts
```bash
# Start everything
./scripts/start.sh

# Stop everything  
./scripts/stop.sh

# Development helpers
./scripts/dev.sh logs [service]     # View logs
./scripts/dev.sh restart [service] # Restart service
./scripts/dev.sh shell [service]   # Open shell
./scripts/dev.sh status            # Service status
./scripts/dev.sh install           # Install dependencies
./scripts/dev.sh clean             # Clean Docker resources
```

## Service URLs

When running:
- **Dashboard**: http://localhost:5173
- **Queue Management API**: http://localhost:3000  
- **Mock IoT API**: http://localhost:3001

## Development Workflow

### VS Code Dev Container
1. Open project in VS Code
2. Reopen in container
3. All dependencies and tools are pre-installed
4. Use integrated terminal: `bun run dev`
5. Edit code with full IntelliSense and extensions

### Docker Compose Development
1. Start services: `./scripts/start.sh`
2. View logs: `./scripts/dev.sh logs`
3. Make code changes (auto-reload enabled)
4. Restart if needed: `./scripts/dev.sh restart [service]`

## Configuration

### Environment Variables
Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
```

Key variables:
- `NODE_ENV=development`
- `PORT=3000` (Queue API)
- `MOCK_IOT_API_PORT=3001` 
- `VITE_API_URL=http://localhost:3000`

### Service Communication
Services communicate via Docker network:
- Queue API → Mock IoT API: `http://mock-iot-api:3001`
- Dashboard → Queue API: `http://localhost:3000`

## Troubleshooting

### Port Conflicts
If ports are already in use:
1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`

### Build Issues
```bash
# Clean rebuild
./scripts/dev.sh clean
./scripts/start.sh

# Or manually
docker-compose down -v
docker system prune -f
docker-compose build --no-cache
```

### Service Not Starting
```bash
# Check logs
./scripts/dev.sh logs [service-name]

# Check status
./scripts/dev.sh status

# Restart specific service
./scripts/dev.sh restart [service-name]
```

### Dependencies Issues
```bash
# Reinstall in containers
./scripts/dev.sh install

# Or rebuild images
docker-compose build --no-cache
```

## VS Code Extensions

The devcontainer includes these extensions:
- TypeScript support
- Prettier (code formatting)
- ESLint (linting)
- Tailwind CSS IntelliSense
- Bun support
- Path IntelliSense
- Auto Rename Tag

## Performance Notes

- Volume mounts enable live code reloading
- Node modules are cached in Docker volumes for faster rebuilds
- Services start in dependency order (IoT API → Queue API → Dashboard)

## Production Deployment

For production:
1. Update environment variables
2. Build optimized images
3. Use Docker Swarm, Kubernetes, or cloud container services
4. Configure proper networking and security
5. Set up monitoring and logging
