# Docker Deployment Guide - Mahallu Frontend

Complete guide for deploying the Mahallu frontend using Docker and Docker Compose.

## 📋 Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- Your CakePHP backend running and accessible

### Check Docker Installation

```bash
docker --version
docker-compose --version
```

---

## 🚀 Quick Start (3 Steps)

### 1. Extract and Navigate

```bash
tar -xzf mahallu-frontend-v2.tar.gz
cd mahallu-frontend
```

### 2. Configure Environment

```bash
# Copy the environment file
cp .env.docker .env

# Edit .env and set your backend URL
nano .env
```

Set your backend URL:
```env
BACKEND_API_URL=https://services.mahallu.com/api
FRONTEND_PORT=3000
```

### 3. Build and Run

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f
```

Visit: **http://localhost:3000**

---

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build for optimized image |
| `docker-compose.yml` | Service orchestration |
| `.env.docker` | Environment variable template |
| `.dockerignore` | Files to exclude from build |

---

## 🔧 Configuration

### Environment Variables

Edit the `.env` file to customize your deployment:

```env
# Backend API URL (REQUIRED)
BACKEND_API_URL=https://services.mahallu.com/api

# Frontend Port (default: 3000)
FRONTEND_PORT=3000

# Optional: Production site URL
SITE_URL=https://mahallu.com
```

### Port Configuration

**Change the frontend port:**

```env
# Use port 8080 instead of 3000
FRONTEND_PORT=8080
```

Then access at: `http://localhost:8080`

---

## 🐳 Docker Commands

### Build and Start

```bash
# Build and start in detached mode
docker-compose up -d

# Build with no cache (fresh build)
docker-compose build --no-cache
docker-compose up -d

# Start only
docker-compose start
```

### Stop and Remove

```bash
# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers, networks, and images
docker-compose down --rmi all

# Remove everything including volumes
docker-compose down -v --rmi all
```

### View Logs

```bash
# Follow logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# Logs for specific service
docker-compose logs -f mahallu-frontend
```

### Restart

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart mahallu-frontend
```

### Container Management

```bash
# List running containers
docker-compose ps

# Execute command in container
docker-compose exec mahallu-frontend sh

# View container resource usage
docker stats
```

---

## 🔄 Update Deployment

When you have code changes:

```bash
# Stop the container
docker-compose down

# Rebuild the image
docker-compose build --no-cache

# Start with new image
docker-compose up -d

# Or do all in one command
docker-compose up -d --build --force-recreate
```

---

## 🌐 Production Deployment

### Option 1: Using Docker Compose (Simple)

1. **On your server**, create a directory:
```bash
mkdir -p /opt/mahallu-frontend
cd /opt/mahallu-frontend
```

2. **Upload files**:
```bash
# Upload: Dockerfile, docker-compose.yml, entire project
scp -r mahallu-frontend/* user@server:/opt/mahallu-frontend/
```

3. **Configure**:
```bash
# On server
cd /opt/mahallu-frontend
cp .env.docker .env
nano .env  # Set production values
```

4. **Deploy**:
```bash
docker-compose up -d
```

5. **Setup reverse proxy** (Nginx example):
```nginx
server {
    listen 80;
    server_name mahallu.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Using Docker Swarm (Advanced)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml mahallu

# List services
docker stack services mahallu

# View logs
docker service logs -f mahallu_mahallu-frontend
```

### Option 3: Using Kubernetes (Enterprise)

Convert Docker Compose to Kubernetes:
```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.26.0/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv kompose /usr/local/bin/

# Convert
kompose convert

# Deploy
kubectl apply -f .
```

---

## 🔒 Security Best Practices

### 1. Use Environment Variables

Never hardcode secrets in Dockerfile or code:
```env
# .env
BACKEND_API_URL=https://api.example.com
API_KEY=your-secret-key
```

### 2. Run as Non-Root User

The Dockerfile already creates a `nextjs` user:
```dockerfile
USER nextjs
```

### 3. Keep Images Updated

```bash
# Update base image
docker pull node:18-alpine

# Rebuild
docker-compose build --no-cache
```

### 4. Use HTTPS in Production

Always use HTTPS for the backend URL:
```env
BACKEND_API_URL=https://services.mahallu.com/api
```

### 5. Limit Container Resources

Add to `docker-compose.yml`:
```yaml
services:
  mahallu-frontend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

---

## 📊 Monitoring and Health Checks

### Built-in Health Check

The container includes automatic health checks:
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Check Health Status

```bash
# View health status
docker-compose ps

# Detailed inspection
docker inspect mahallu-frontend | grep -A 10 Health
```

### Monitor Container

```bash
# Real-time stats
docker stats mahallu-frontend

# Resource usage
docker-compose top
```

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs mahallu-frontend

# Common issues:
# 1. Port already in use
sudo lsof -i :3000
# Kill the process or change FRONTEND_PORT

# 2. Build errors
docker-compose build --no-cache

# 3. Permission issues
sudo chown -R $USER:$USER .
```

### Backend Connection Issues

```bash
# Test from inside container
docker-compose exec mahallu-frontend sh
wget -O- https://services.mahallu.com/api/news

# Check environment variables
docker-compose exec mahallu-frontend env | grep API_URL
```

### Application Errors

```bash
# View application logs
docker-compose logs -f mahallu-frontend

# Check if container is running
docker-compose ps

# Restart container
docker-compose restart mahallu-frontend
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Increase memory limit in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

---

## 🔧 Advanced Configuration

### Custom Network

Connect to existing network:
```yaml
networks:
  default:
    external:
      name: my-existing-network
```

### Volume Mounting (Development)

For live code updates during development:
```yaml
services:
  mahallu-frontend:
    volumes:
      - ./app:/app/app
      - ./components:/app/components
      - ./lib:/app/lib
```

### Multi-Container Setup

Run with Redis cache:
```yaml
services:
  mahallu-frontend:
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---

## 📈 Scaling

### Horizontal Scaling

```bash
# Run 3 instances
docker-compose up -d --scale mahallu-frontend=3
```

### Load Balancing with Nginx

```nginx
upstream mahallu_frontend {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    location / {
        proxy_pass http://mahallu_frontend;
    }
}
```

---

## 💾 Backup and Restore

### Backup Container

```bash
# Export container
docker export mahallu-frontend > mahallu-frontend-backup.tar

# Save image
docker save mahallu-frontend:latest > mahallu-frontend-image.tar
```

### Restore

```bash
# Load image
docker load < mahallu-frontend-image.tar

# Start container
docker-compose up -d
```

---

## 📝 Example: Complete Production Setup

```bash
# 1. Server setup
ssh user@production-server
sudo mkdir -p /opt/mahallu
cd /opt/mahallu

# 2. Upload files
# (from local machine)
scp -r mahallu-frontend user@production-server:/opt/mahallu/

# 3. Configure
cd /opt/mahallu/mahallu-frontend
cp .env.docker .env
nano .env
# Set:
# BACKEND_API_URL=https://services.mahallu.com/api
# FRONTEND_PORT=3000

# 4. Build and deploy
docker-compose build
docker-compose up -d

# 5. Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/mahallu
# Add proxy configuration

sudo ln -s /etc/nginx/sites-available/mahallu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 6. Setup SSL with Let's Encrypt
sudo certbot --nginx -d mahallu.com

# 7. Setup auto-start
sudo systemctl enable docker

# 8. Monitor
docker-compose logs -f
```

---

## 🎯 Performance Optimization

### Build Optimization

Already included:
- Multi-stage builds
- Layer caching
- Minimal alpine image
- Production dependencies only

### Runtime Optimization

```yaml
# Add to docker-compose.yml
environment:
  - NODE_ENV=production
  - NEXT_TELEMETRY_DISABLED=1
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 1G
```

---

## ✅ Checklist

### Pre-Deployment
- [ ] Docker and Docker Compose installed
- [ ] Backend API URL confirmed
- [ ] `.env` file configured
- [ ] Ports available (default: 3000)

### Deployment
- [ ] `docker-compose build` successful
- [ ] `docker-compose up -d` running
- [ ] Health check passing
- [ ] Application accessible

### Post-Deployment
- [ ] Backend connection working
- [ ] News page loading
- [ ] Families page loading
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Logs monitored

---

## 📞 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify environment: `docker-compose exec mahallu-frontend env`
3. Test backend: `curl https://services.mahallu.com/api/news`
4. Rebuild: `docker-compose build --no-cache`

---

## 🎉 Summary

You now have:

✅ Optimized Docker image with multi-stage build
✅ Docker Compose for easy orchestration
✅ Environment variable configuration
✅ Health checks and monitoring
✅ Production-ready setup
✅ Complete deployment guide

**Start now:**
```bash
docker-compose up -d
```

Visit: **http://localhost:3000** 🚀
