# TimeHogger Deployment Guide

## Environment Variables Configuration

### Development (`.env`)
```bash
VITE_API_URL=http://localhost:3001/api
VITE_API_PORT=3001
```

### Production Options

#### Option 1: API on same server (recommended)
```bash
# .env.production
VITE_API_URL=/api
```
Configure your web server (nginx, apache) to proxy `/api` to your Node.js server.

#### Option 2: Separate API server
```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com/api
```

#### Option 3: Subdomain
```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com/api
```

## Deployment Scenarios

### 1. Single Server Deployment
- Frontend and API on same server
- Use nginx to serve static files and proxy API calls
- Set `VITE_API_URL=/api`

### 2. Separate Servers
- Frontend on CDN/static hosting
- API on separate server
- Set full API URL in `VITE_API_URL`

### 3. Docker Deployment
```dockerfile
# Use environment variables in Docker
ENV VITE_API_URL=http://api-container:3001/api
```

## Commands

```bash
# Development
npm run dev:full

# Production build
npm run build:prod

# Production preview
npm run preview:prod

# Deploy (build + preview)
npm run deploy
```

## Server Configuration Example (nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Serve static frontend files
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API calls to Node.js server
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
