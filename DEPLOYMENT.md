# Deployment Guide: Q-Triage Clinic Optimizer

This guide explains how to deploy the **Q-Triage** application (React Frontend + Node.js/SQLite Backend) to a production server with HTTPS.

Since this application uses a local SQLite database, the best way to deploy it is on a **Virtual Private Server (VPS)** (like DigitalOcean, AWS EC2, Linode, or Vultr) or a service with persistent storage like **Render**.

---

## Option 1: Deploying to Render.com (Easiest)
Render offers a "Web Service" that supports Node.js.

1.  **Push your code to GitHub/GitLab**.
2.  Create a new **Web Service** on Render.
3.  Connect your repository.
4.  **Settings**:
    *   **Runtime**: Node
    *   **Build Command**: `npm install && npm run build && cd server && npm install`
    *   **Start Command**: `cd server && npm start`
5.  **Environment Variables**:
    *   Add `GEMINI_API_KEY`: *(Your key)*
6.  **Persistent Disk (Important)**:
    *   Since we use SQLite (`clinic.db`), you **must** add a "Disk" in Render settings to mount at `/opt/render/project/src/server`. Otherwise, your database will be wiped on every restart.
7.  **HTTPS**: Render handles HTTPS automatically for free.

---

## Option 2: Deploying to a VPS (Standard Production)
This method gives you full control. You will need a domain name (e.g., `clinic-app.com`) and a server (Ubuntu recommended).

### 1. Prepare the Server
Connect to your server via SSH:
```bash
ssh root@your-server-ip
```

Install Node.js (v18+), Nginx, and Certbot:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx (Web Server)
sudo apt install nginx

# Install Certbot (for free SSL/HTTPS)
sudo apt install certbot python3-certbot-nginx
```

### 2. Upload Your Code
You can use `git clone` or `scp` to copy your project folder to `/var/www/q-triage`.

```bash
git clone <your-repo-url> /var/www/q-triage
cd /var/www/q-triage
```

### 3. Build and Run the App
Install dependencies and build the frontend:
```bash
npm install
npm run build
cd server
npm install
```

Start the server using `pm2` (Process Manager) to keep it alive:
```bash
npm install -g pm2
pm2 start index.js --name "clinic-app"
pm2 save
pm2 startup
```

Your app is now running on `http://localhost:3001`.

### 4. Configure Nginx (Reverse Proxy)
We need Nginx to forward public traffic (port 80) to your app (port 3001).

Create a config file:
```bash
sudo nano /etc/nginx/sites-available/clinic-app
```

Paste the following content (replace `your-domain.com` with your actual domain):
```nginx
server {
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/clinic-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Enable HTTPS
Run Certbot to automatically get an SSL certificate and configure HTTPS:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will automatically update your Nginx config to force HTTPS.

**Done!** Your app is now secure and live at `https://your-domain.com`.
