# DigitalOcean Production Deployment Guide

This document outlines the step-by-step process for deploying the Knoweb Sales Management System to a DigitalOcean Droplet using Docker and GitHub Actions.

## Architecture Overview

DigitalOcean Droplet
├── frontend container (Nginx + React, Port 80)
├── backend container (Spring Boot, Port 8080 internal)
├── postgres container (PostgreSQL 16, Port 5432 internal)
├── postgres-data volume (Persistent database storage)
└── uploads-data volume (Persistent file uploads)

**CRITICAL WARNING**: PostgreSQL stores its data inside the `postgres-data` Docker volume on the Droplet. **Never** run commands like `docker compose down -v`, `docker volume rm`, or `docker system prune --volumes` unless you intend to permanently delete the production database.

---

## 1. DigitalOcean Infrastructure Setup

### Create the Droplet
1. Create a Droplet (Ubuntu 24.04 LTS).
2. Choose a size (e.g., Basic, 2GB RAM minimum recommended for Spring Boot + React + PostgreSQL in Docker).
3. Add your SSH keys.
4. Name the droplet and create it.

---

## 2. Server Preparation

SSH into your new Droplet:
```bash
ssh root@<your_droplet_ip>
```

### A. Initial Security and Firewall
```bash
# Allow OpenSSH
ufw allow OpenSSH

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable Firewall (PostgreSQL port 5432 is explicitly NOT exposed)
ufw enable
```

### B. Install Docker & Docker Compose
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install Docker packages
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### C. Create Deployment Directory
```bash
mkdir -p /opt/knoweb-sales/uploads
mkdir -p /opt/knoweb-sales/backups/postgres
cd /opt/knoweb-sales
```
The `uploads` folder will persist files that users upload.
The `backups` folder will hold automated database dumps.

### D. Configure Production Environment Variables
Create the `.env` file securely:
```bash
nano /opt/knoweb-sales/.env
```
Add the following configurations (replacing placeholders with actual values):

```env
# PostgreSQL Internal Docker Configuration
POSTGRES_DB=sales_management
POSTGRES_USER=knoweb_prod
POSTGRES_PASSWORD=generate_a_very_strong_db_password

# Spring Boot Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/sales_management
SPRING_DATASOURCE_USERNAME=knoweb_prod
SPRING_DATASOURCE_PASSWORD=generate_a_very_strong_db_password

# Security Secrets (Generate secure random strings)
JWT_SECRET=generate_a_very_long_secure_random_string_here_12345
ENCRYPTION_SECRET_KEY=generate_another_secure_key_here
```

Set restrictive permissions on the `.env` file so only root can read it:
```bash
chmod 600 /opt/knoweb-sales/.env
```

---

## 3. GitHub Actions CI/CD Setup

### A. Configure GitHub Secrets
In your GitHub Repository, navigate to **Settings > Secrets and variables > Actions > New repository secret**.

Add the following secrets:
1. `DO_HOST`: The IP address of your DigitalOcean Droplet.
2. `DO_USER`: `root` (or your deploy user).
3. `DO_SSH_PRIVATE_KEY`: The private SSH key (`~/.ssh/id_rsa` or `id_ed25519`) corresponding to the public key you added to the Droplet.

### B. Package Registry (GHCR) Configuration
The workflow uses `GITHUB_TOKEN` to push to `ghcr.io`. Ensure your repository settings allow Actions to write to packages:
1. Go to **Settings > Actions > General**.
2. Under **Workflow permissions**, ensure **Read and write permissions** is selected.

---

## 4. Safe First Deployment Procedure

Since this application uses Flyway for migrations, a fresh PostgreSQL database will trigger all migrations from `V1` to the current version automatically.

1. Verify the CI/CD files are merged into `main`. The GitHub Action will build the images and deploy them.
2. The deployment automatically runs:
   ```bash
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d --remove-orphans
   ```
3. Docker Compose will automatically start `postgres` first, wait for it to become healthy, then start `backend` (which runs Flyway), and finally `frontend`.

### Verify Health (Safe Commands)
SSH into the Droplet:
```bash
cd /opt/knoweb-sales
docker compose -f docker-compose.prod.yml ps
```
Check backend logs to ensure Flyway migrated successfully:
```bash
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```
Check PostgreSQL logs:
```bash
docker compose -f docker-compose.prod.yml logs --tail=100 postgres
```

---

## 5. Existing Data Migration (Optional)
If you need to copy your local development database to this production Droplet, follow this approach:
1. Stop the backend temporarily so Flyway doesn't interfere:
   `docker compose -f docker-compose.prod.yml stop backend`
2. Create a local backup of your dev DB:
   `pg_dump -U postgres -d sales_management > dev_dump.sql`
3. SCP it to the Droplet:
   `scp dev_dump.sql root@<ip>:/opt/knoweb-sales/`
4. Restore into the Docker container:
   `docker compose -f docker-compose.prod.yml exec -T postgres psql -U knoweb_prod -d sales_management < dev_dump.sql`
5. Restart the backend:
   `docker compose -f docker-compose.prod.yml start backend`

---

## 6. Database Backups Strategy
Because the database is self-hosted on the Droplet, you **must** take backups. DigitalOcean Droplet Snapshots are a good start, but logical `pg_dump` backups are strictly necessary.

### Manual Backup Command
```bash
cd /opt/knoweb-sales
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U knoweb_prod -d sales_management -F c > /opt/knoweb-sales/backups/postgres/db_backup_$(date +%Y%m%d).dump
```

### Automated Backup (Cron)
We recommend setting up a daily cron job to run the backup command.
You **MUST** back up these dump files off the server (e.g., uploading to DigitalOcean Spaces or AWS S3), because if the Droplet dies, both the DB and the backup files will be lost.

### Restore Procedure
1. Stop the backend: `docker compose stop backend`
2. Optional safety dump: Backup current state just in case.
3. Drop/recreate DB (CAUTION!): Connect to postgres and drop the DB if starting fresh.
4. Restore: `docker compose exec -T postgres pg_restore -U knoweb_prod -d sales_management -1 /opt/knoweb-sales/backups/postgres/db_backup_FILE.dump`
5. Start backend: `docker compose start backend`

---

## 7. Rollback Strategy & Upgrades

### Application Rollback
If a deployment fails, you can rollback the frontend and backend using SHA tags.
1. Find the Git Commit SHA of the previously working version.
2. Edit the `.env` file or export the specific SHAs:
```bash
cd /opt/knoweb-sales
export BACKEND_IMAGE=ghcr.io/knoweb/sales-management-system-backend:<previous_sha>
export FRONTEND_IMAGE=ghcr.io/knoweb/sales-management-system-frontend:<previous_sha>
docker compose -f docker-compose.prod.yml up -d
```
**⚠️ Warning:** Rolling back the application code does **NOT** roll back database schema changes made by Flyway. If a recent deployment applied forward database migrations, the old code might be incompatible with the new schema. 

### PostgreSQL Version Upgrades
Do **NOT** simply change `postgres:16-alpine` to `postgres:17-alpine` in the `docker-compose.prod.yml` file. Docker cannot automatically upgrade PostgreSQL data directories between major versions. A major version upgrade requires creating a logical `pg_dump` of the 16 database, spinning up the 17 container, and importing the dump.

---

## 8. Server Resource Monitoring
Monitor your disk usage safely without risking database data:
```bash
df -h
docker system df
docker volume ls
```
Logs are automatically rotated by Docker using the `json-file` driver configured in the compose file (max 10mb, 5 files per container).
