# KagazAi Production Deployment Guide

This guide details how to deploy KagazAi to production with a custom domain, HTTPS/WSS encryption, and environment variable configuration.

## 1. Environment Variables Reference

### Backend (`apps/server/.env`)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | `5001` | HTTP port for the Express REST API. |
| `HOCUSPOCUS_PORT` | Number | `1234` | WebSocket port for the Hocuspocus Yjs sync server. |
| `MONGODB_URI` | String | Required | Connection string for MongoDB Atlas or local MongoDB replica set. |
| `CLIENT_URL` | String | `http://localhost:3000` | Allowed origin for CORS and cookie domain matching in production (e.g. `https://kagazai.yourdomain.com`). |
| `JWT_SECRET` | String | Required | Secret key for signing and verifying JSON Web Tokens (min. 32 random characters). |
| `REDIS_HOST` | String | `127.0.0.1` | Hostname of the Redis instance for multi-node CRDT synchronization. |
| `REDIS_PORT` | Number | `6379` | Port of the Redis instance. |
| `NODE_ENV` | String | `development` | Set to `production` to activate secure cookie flags (`secure: true`). |

### Frontend (`apps/web/.env.local` or container environment)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | String | `http://localhost:5001` | Public URL for backend REST API endpoints (`/auth`, `/api/documents`, `/api/comments`). |
| `NEXT_PUBLIC_COLLAB_URL` | String | `ws://localhost:1234` | Public WebSocket endpoint for Yjs real-time document sync. In production with SSL, use `wss://kagazai.yourdomain.com/collab`. |

---

## 2. Custom Domain & DNS Setup

To attach a custom domain to your KagazAi deployment, follow these exact DNS configuration steps:

### Step 2.1: Domain Purchase
Purchase a domain from any ICANN-accredited registrar (e.g., Cloudflare Registrar, Namecheap, or Porkbun).

### Step 2.2: DNS Records Configuration
Navigate to your registrar or DNS host management console (e.g., Cloudflare DNS dashboard) and add the following records pointing to your server's public IP address:

| Type | Name | Content / Value | TTL | Proxy Status |
| :--- | :--- | :--- | :--- | :--- |
| `A` | `@` (or `kagazai`) | `YOUR_SERVER_PUBLIC_IPV4` | Auto / 300s | DNS Only (or Proxied) |
| `A` | `api` | `YOUR_SERVER_PUBLIC_IPV4` | Auto / 300s | DNS Only |
| `CNAME` | `www` | `kagazai.yourdomain.com` | Auto / 300s | DNS Only |

*Tip: If using Cloudflare, start with "DNS Only" (grey cloud) while obtaining SSL certificates via Certbot.*

---

## 3. SSL / TLS Setup with Nginx & Let's Encrypt

Both REST cookies and WebSockets require secure HTTPS and WSS connections in production.

### Step 3.1: Install Nginx & Certbot on the Host

```bash
# Ubuntu / Debian
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Step 3.2: Obtain Free SSL Certificate via Let's Encrypt

```bash
sudo certbot certonly --nginx -d kagazai.yourdomain.com -d api.kagazai.yourdomain.com
```

### Step 3.3: Configure Nginx Reverse Proxy with WebSocket Support

Create `/etc/nginx/sites-available/kagazai.conf`:

```nginx
# Upstream clusters
upstream web_frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream server_rest {
    least_conn;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
    keepalive 32;
}

upstream server_collab_ws {
    ip_hash;
    server 127.0.0.1:1234;
    server 127.0.0.1:1235;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name kagazai.yourdomain.com;
    return 301 https://$host$request_uri;
}

# Main Application Server (HTTPS)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name kagazai.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/kagazai.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kagazai.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend pages
    location / {
        proxy_pass http://web_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # REST API endpoints
    location ~ ^/(auth|api)/ {
        proxy_pass http://server_rest;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # WebSocket Real-Time Synchronization (WSS)
    location /collab {
        proxy_pass http://server_collab_ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

Enable the configuration and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/kagazai.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Docker Compose Production Execution

To deploy the entire scaled backend (MongoDB, Redis, Node server instances, and Next.js frontend) with one command:

```bash
# Build and run containers in detached mode
docker-compose -f docker-compose.yml up -d --build

# View container logs
docker-compose logs -f
```

---

## 5. Launch Blockers Verification Checklist

Before presenting KagazAi publicly, verify all 5 launch blockers:

- [x] **1. Custom Domain & HTTPS**: Nginx configuration with TLSv1.2/1.3 and automatic certbot renewal configured.
- [x] **2. Favicon and App Icons**: `/favicon.svg` (folded paper vector), `/apple-touch-icon.png` (180x180 px), and `/manifest.json` configured in `RootLayout`.
- [x] **3. Builder/AI Tags Removed**: Codebase audited with zero placeholder tags, zero purple gradients, and zero AI hype copy.
- [x] **4. Privacy Policy Live & Linked**: Plain-language policy live at `/privacy` and linked from both the footer and the registration flow.
- [x] **5. Terms of Service Live & Linked**: Clear terms live at `/terms` and linked from both the footer and the registration flow.
