# Docker Quick Start - 2 Minutes Setup

## Option 1: Simple Setup (Recommended for Testing)

```bash
# 1. Extract the files
tar -xzf mahallu-frontend-v2.tar.gz
cd mahallu-frontend

# 2. Set your backend URL
echo "BACKEND_API_URL=https://services.mahallu.com/api" > .env
echo "FRONTEND_PORT=3000" >> .env

# 3. Start!
docker-compose up -d

# 4. Visit
open http://localhost:3000
```

**That's it!** Your frontend is running.

---

## Option 2: Automated Setup (Even Easier)

```bash
# 1. Extract
tar -xzf mahallu-frontend-v2.tar.gz
cd mahallu-frontend

# 2. Run the startup script
chmod +x start.sh
./start.sh
```

The script will guide you through the setup!

---

## Option 3: Production with Nginx

```bash
# 1. Extract
tar -xzf mahallu-frontend-v2.tar.gz
cd mahallu-frontend

# 2. Configure
cp .env.docker .env
nano .env  # Set your backend URL

# 3. Start with Nginx
docker-compose -f docker-compose.nginx.yml up -d

# 4. Access
# HTTP: http://your-domain.com
# The frontend is behind Nginx reverse proxy
```

---

## Environment Variables

Create `.env` file with:

```env
# REQUIRED: Your CakePHP backend API URL
BACKEND_API_URL=https://services.mahallu.com/api

# OPTIONAL: Port (default: 3000)
FRONTEND_PORT=3000

# OPTIONAL: Timezone
TIMEZONE=Asia/Kolkata

# OPTIONAL: Domain (for production)
DOMAIN=mahallu.com
```

---

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop
docker-compose stop

# Restart
docker-compose restart

# Remove everything
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

---

## Different Backend URLs

### Local Backend
```env
BACKEND_API_URL=http://localhost:8765/api
```

### Staging Backend
```env
BACKEND_API_URL=https://staging.mahallu.com/api
```

### Production Backend
```env
BACKEND_API_URL=https://services.mahallu.com/api
```

---

## Port Conflicts?

If port 3000 is already in use:

```env
# Use different port
FRONTEND_PORT=8080
```

Then access at: `http://localhost:8080`

---

## Troubleshooting

### Can't connect to backend?

```bash
# Test from inside container
docker-compose exec mahallu-frontend sh
wget -O- https://services.mahallu.com/api/news
```

### Container won't start?

```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Need to see environment variables?

```bash
docker-compose exec mahallu-frontend env
```

---

## Production Deployment

For production servers:

1. **Upload files** to server
2. **Set production URL** in `.env`
3. **Use production compose**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```
4. **Setup SSL** (see DOCKER_GUIDE.md for details)

---

## Complete Documentation

See `DOCKER_GUIDE.md` for:
- Detailed deployment instructions
- Production setup with SSL
- Nginx configuration
- Monitoring and scaling
- Security best practices
- Troubleshooting guide

---

## 🎉 You're Done!

Your Mahallu frontend is now running in Docker!

**Next steps:**
1. ✅ Visit http://localhost:3000
2. ✅ Test the News page
3. ✅ Verify backend connection
4. ✅ Deploy to production (optional)

**Need help?** Check `DOCKER_GUIDE.md` for complete documentation.
