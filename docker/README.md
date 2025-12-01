# TaskFlow Docker Deployment

This directory contains Docker configuration for deploying the TaskFlow application.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Host (Port 80)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    nginx (taskflow-web)                     │
│                                                             │
│  ┌─────────────────┐           ┌─────────────────────────┐  │
│  │  Static Files   │           │   Reverse Proxy         │  │
│  │  /index.html    │           │   /api/* → server:3000  │  │
│  │  /assets/*      │           │                         │  │
│  └─────────────────┘           └───────────┬─────────────┘  │
└────────────────────────────────────────────┼────────────────┘
                                             │
                                             ▼
                          ┌─────────────────────────────────┐
                          │      Express (taskflow-server)  │
                          │           Port 3000             │
                          └───────────────┬─────────────────┘
                                          │
                                          ▼
                          ┌─────────────────────────────────┐
                          │    MongoDB Atlas (External)     │
                          │         or Local MongoDB        │
                          └─────────────────────────────────┘
```

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 22.x (for local development only)

## Quick Start

### Production (with MongoDB Atlas)

1. **Configure environment:**
   ```bash
   cd docker
   cp .env.example .env
   nano .env  # Add your MongoDB Atlas connection string and secrets
   ```

2. **Build and start:**
   ```bash
   docker-compose up -d --build
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Access application:**
   - Web: http://localhost
   - API: http://localhost/api

### Development (with Local MongoDB)

1. **Start with local MongoDB:**
   ```bash
   cd docker
   docker-compose -f docker-compose.dev.yml up -d --build
   ```

2. **Access services:**
   - Web: http://localhost
   - API: http://localhost:3000 (direct) or http://localhost/api (via nginx)
   - MongoDB Admin: http://localhost:8081

3. **Stop and clean up:**
   ```bash
   docker-compose -f docker-compose.dev.yml down -v
   ```

## Commands Reference

### Build & Run

```bash
# Production build and run
docker-compose up -d --build

# Development with local MongoDB
docker-compose -f docker-compose.dev.yml up -d --build

# Rebuild specific service
docker-compose up -d --build server
docker-compose up -d --build web
```

### Monitoring

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server
docker-compose logs -f web

# Check container status
docker-compose ps

# Check resource usage
docker stats
```

### Maintenance

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Restart specific service
docker-compose restart server

# Execute command in container
docker-compose exec server sh
docker-compose exec web sh
```

### Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove all unused resources
docker system prune -a
```

## Environment Variables

### Required (Production)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `MONGODB_DB_NAME` | Database name | `taskflow` |
| `AUTH_SECRET_USER` | Authentication secret (32+ chars) | `your-secure-secret-here` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Server port |
| `CORS_ORIGINS` | `http://localhost` | Allowed CORS origins |
| `TRUSTED_ORIGINS` | `http://localhost` | Trusted origins for auth |

## Health Checks

Both containers include health checks:

```bash
# Check container health
docker-compose ps

# Manual health check
curl http://localhost/health      # nginx
curl http://localhost:3000/       # server (dev mode only)
```

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker-compose logs server
docker-compose logs web

# Verify network
docker network inspect taskflow-network
```

### MongoDB connection issues

```bash
# Test connection from server container
docker-compose exec server sh
wget -q --spider http://localhost:3000/

# Check environment variables
docker-compose exec server env | grep MONGO
```

### nginx proxy errors (502 Bad Gateway)

```bash
# Ensure server is healthy
docker-compose ps

# Check server logs
docker-compose logs -f server

# Verify network connectivity
docker-compose exec web ping server
```

### Rebuild from scratch

```bash
# Complete rebuild
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## Production Considerations

### Security

- [ ] Change `AUTH_SECRET_USER` to a strong random value
- [ ] Use HTTPS (add SSL/TLS configuration)
- [ ] Restrict MongoDB network access
- [ ] Enable MongoDB authentication
- [ ] Review and restrict CORS origins

### Performance

- [ ] Enable nginx caching for static assets
- [ ] Configure MongoDB connection pooling
- [ ] Set appropriate resource limits in docker-compose
- [ ] Enable log rotation

### Monitoring

- [ ] Set up container health monitoring
- [ ] Configure log aggregation
- [ ] Monitor MongoDB performance
- [ ] Set up alerts for container failures

## SSL/HTTPS Configuration (Production)

For production deployments, add SSL support by modifying `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... rest of configuration
}

server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

Add certificate volume in `docker-compose.yml`:

```yaml
web:
  volumes:
    - ./ssl:/etc/nginx/ssl:ro
```

## File Structure

```
docker/
├── nginx/
│   └── nginx.conf          # nginx reverse proxy configuration
├── Dockerfile.server       # Express.js server image
├── Dockerfile.web          # Vite build + nginx image
├── docker-compose.yml      # Production orchestration
├── docker-compose.dev.yml  # Development with local MongoDB
├── .dockerignore           # Build context exclusions
├── .env.example            # Environment template
└── README.md               # This file
```