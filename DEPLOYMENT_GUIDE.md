# 🚀 Crisp Interview Assistant - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Crisp AI-Powered Interview Assistant application in production environments using Docker containers.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │    Frontend     │    │    Backend      │
│    (Nginx)      │───▶│   (React/Vite)  │───▶│  (Node.js/TS)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                               ┌─────────────────┐
                                               │    MongoDB      │
                                               │    (Atlas)      │
                                               └─────────────────┘
```

## Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+ recommended) or macOS
- **RAM**: Minimum 4GB (8GB+ recommended)
- **CPU**: 2+ cores
- **Storage**: 20GB+ free space
- **Network**: Stable internet connection

### Required Software
- Docker (20.10+)
- Docker Compose (2.0+)
- Git
- SSL certificate (for HTTPS in production)

### External Services
- **MongoDB Atlas** account with production cluster
- **Firebase** project with service account
- **Google AI (Gemini)** API key
- **Domain name** with DNS configured (for production)

## Quick Start (Development)

```bash
# Clone the repository
git clone <your-repo-url>
cd crisp-interview-assistant

# Start development environment
docker-compose up -d

# Check status
docker-compose ps
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Production Deployment

### 1. Server Setup

#### Initial Server Configuration
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### Firewall Configuration
```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Application Setup

#### Clone and Configure
```bash
# Create application directory
sudo mkdir -p /opt/crisp-interview
sudo chown $USER:$USER /opt/crisp-interview
cd /opt/crisp-interview

# Clone repository
git clone <your-repo-url> .

# Create production environment file
cp .env.production.example .env
```

#### Configure Environment Variables
Edit `.env` file with your production values:

```bash
# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://prod-user:secure-password@cluster0.vkccwze.mongodb.net/crisp-interview-prod?retryWrites=true&w=majority

# Firebase Production Config
FIREBASE_PROJECT_ID=your-prod-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRODUCTION_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-prod-project-id.iam.gserviceaccount.com

# Security
JWT_SECRET=$(openssl rand -base64 32)
BCRYPT_SALT_ROUNDS=12

# Domain Configuration
DOMAIN=yourdomain.com
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# API Keys
GEMINI_API_KEY=your-production-gemini-api-key

# Redis (Optional)
REDIS_PASSWORD=$(openssl rand -base64 32)
```

### 3. SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Verify certificate location
sudo ls -la /etc/letsencrypt/live/yourdomain.com/
```

### 4. Production Deployment

#### Using Deployment Script
```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh production
```

#### Manual Deployment
```bash
# Build and start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Health Checks and Monitoring

#### Verify Deployment
```bash
# Check service health
curl -f http://localhost:3001/health
curl -f http://localhost:3000

# Check SSL (if configured)
curl -f https://yourdomain.com/health
```

#### Monitor Services
```bash
# View real-time logs
docker-compose logs -f

# Check resource usage
docker stats

# View service status
docker-compose ps
```

## CI/CD Pipeline (GitHub Actions)

### Required Secrets

Configure these secrets in your GitHub repository:

```
# Server Access
SSH_PRIVATE_KEY=<your-ssh-private-key>
SSH_USER=<your-server-username>
SSH_HOST=<your-server-ip-or-domain>

# API Keys
GEMINI_API_KEY=<your-gemini-api-key>

# Optional: Notifications
SLACK_WEBHOOK_URL=<slack-webhook-for-notifications>
SNYK_TOKEN=<snyk-token-for-security-scanning>
```

### Deployment Triggers

- **Automatic**: Pushes to `main` branch trigger production deployment
- **Manual**: Use GitHub Actions workflow dispatch
- **Pull Requests**: Run tests and security scans

## Environment-Specific Configurations

### Development
```bash
# Start development environment
docker-compose up -d

# Use development overrides
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Staging
```bash
# Use staging configuration
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

### Production
```bash
# Use production configuration with resource limits
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Maintenance and Operations

### Backup Strategy

#### Database Backup (MongoDB Atlas)
- Enable automated backups in MongoDB Atlas
- Configure backup retention policies
- Test restore procedures regularly

#### Application Data Backup
```bash
# Backup application data
docker-compose exec backend npm run backup

# Backup uploaded files (if any)
rsync -av /opt/crisp-interview/uploads/ /backup/crisp-uploads/
```

### Updates and Rollbacks

#### Application Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
./deploy.sh production

# Rollback if needed
git checkout <previous-commit>
./deploy.sh production
```

#### Database Migrations
```bash
# Run database migrations (if implemented)
docker-compose exec backend npm run migrate
```

### Log Management

#### Log Rotation
```bash
# Configure log rotation for Docker
sudo nano /etc/logrotate.d/docker-container

# Content:
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  size 100M
  missingok
  delaycompress
  copytruncate
}
```

#### Centralized Logging (Optional)
- Configure ELK stack or similar
- Use Docker logging drivers
- Set up log aggregation

### Security Best Practices

#### Regular Security Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d --force-recreate

# Scan for vulnerabilities
docker scan crisp-frontend:latest
docker scan crisp-backend:latest
```

#### Access Control
- Use SSH key authentication
- Implement fail2ban for SSH protection
- Regular security audits
- Monitor access logs

### Performance Optimization

#### Database Optimization
- Monitor MongoDB performance metrics
- Implement proper indexing
- Regular performance reviews

#### Application Performance
- Monitor application metrics
- Implement caching strategies
- Optimize Docker images
- Use CDN for static assets

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check service logs
docker-compose logs <service-name>

# Check resource usage
docker stats

# Restart specific service
docker-compose restart <service-name>
```

#### Database Connection Issues
```bash
# Verify MongoDB connection string
# Check network connectivity
# Verify credentials

# Test connection
docker-compose exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected'))
  .catch(err => console.error('Error:', err));
"
```

#### SSL Certificate Issues
```bash
# Renew certificates
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

### Performance Issues

#### High CPU Usage
- Check application logs for errors
- Monitor database queries
- Implement caching
- Scale horizontally if needed

#### Memory Issues
- Increase container memory limits
- Check for memory leaks
- Implement proper garbage collection

### Recovery Procedures

#### Service Recovery
```bash
# Emergency restart all services
docker-compose down
docker-compose up -d

# Restore from backup (if needed)
# Follow backup restoration procedures
```

## Monitoring and Alerting

### Basic Monitoring
```bash
# Health check script
#!/bin/bash
if ! curl -f http://localhost:3001/health; then
    echo "Backend health check failed!"
    # Send alert
fi

if ! curl -f http://localhost:3000; then
    echo "Frontend health check failed!"
    # Send alert
fi
```

### Advanced Monitoring
- Implement Prometheus + Grafana
- Set up application performance monitoring
- Configure alerting rules
- Monitor business metrics

## Support and Maintenance

### Regular Maintenance Tasks

#### Daily
- Monitor application health
- Check error logs
- Verify backup completion

#### Weekly  
- Review performance metrics
- Update security patches
- Test backup restoration

#### Monthly
- Security audit
- Performance optimization review
- Dependency updates
- Documentation updates

### Getting Help

- Check application logs: `docker-compose logs`
- Review this documentation
- Check GitHub issues and discussions
- Contact development team

## Appendix

### Resource Requirements by Environment

| Environment | CPU | RAM | Storage | Bandwidth |
|------------|-----|-----|---------|-----------|
| Development | 2 cores | 4GB | 20GB | 100 Mbps |
| Staging | 2 cores | 8GB | 50GB | 500 Mbps |
| Production | 4+ cores | 16GB+ | 100GB+ | 1+ Gbps |

### Port Configuration

| Service | Internal Port | External Port | Description |
|---------|--------------|---------------|-------------|
| Frontend | 80 | 3000 | React application |
| Backend | 3001 | 3001 | API server |
| MongoDB | 27017 | - | Database (Atlas) |
| Redis | 6379 | - | Session storage |
| Nginx | 80/443 | 80/443 | Load balancer |

### Environment Variables Reference

See `.env.production.example` for complete list of required environment variables.

---

**Need help?** Check the troubleshooting section or contact the development team.