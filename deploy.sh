#!/bin/bash
set -e

# Crisp Interview Assistant - Deployment Script
echo "🚀 Starting Crisp Interview Assistant Deployment..."

# Configuration
ENV=${1:-production}
COMPOSE_FILE="docker-compose.yml"
PROD_COMPOSE_FILE="docker-compose.prod.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_info "Docker and Docker Compose are installed ✅"
}

# Check environment file
check_env_file() {
    if [ "$ENV" = "production" ] && [ ! -f ".env" ]; then
        log_error "Production .env file not found!"
        log_info "Please copy .env.production.example to .env and configure your production values:"
        log_info "cp .env.production.example .env"
        exit 1
    fi
    
    log_info "Environment configuration found ✅"
}

# Build and start services
deploy() {
    log_info "Building Docker images..."
    
    if [ "$ENV" = "production" ]; then
        log_info "Deploying in PRODUCTION mode"
        docker-compose -f $COMPOSE_FILE -f $PROD_COMPOSE_FILE build --no-cache
        
        log_info "Starting production services..."
        docker-compose -f $COMPOSE_FILE -f $PROD_COMPOSE_FILE up -d
    else
        log_info "Deploying in DEVELOPMENT mode"
        docker-compose -f $COMPOSE_FILE build --no-cache
        
        log_info "Starting development services..."
        docker-compose -f $COMPOSE_FILE up -d
    fi
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Wait for services to be ready
    sleep 10
    
    # Check backend health
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        log_info "Backend service is healthy ✅"
    else
        log_error "Backend service health check failed ❌"
        return 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        log_info "Frontend service is healthy ✅"
    else
        log_error "Frontend service health check failed ❌"
        return 1
    fi
    
    log_info "All services are running successfully! 🎉"
}

# Show service status
show_status() {
    log_info "Service Status:"
    docker-compose ps
    
    echo ""
    log_info "Access your application:"
    log_info "• Frontend: http://localhost:3000"
    log_info "• Backend API: http://localhost:3001"
    log_info "• API Health: http://localhost:3001/health"
}

# Cleanup function
cleanup() {
    log_warn "Cleaning up previous deployment..."
    docker-compose down --remove-orphans
    docker system prune -f
    log_info "Cleanup completed ✅"
}

# Main deployment flow
main() {
    echo "===========================================" 
    echo "   Crisp Interview Assistant Deployment   "
    echo "==========================================="
    
    # Parse command line arguments
    case "$1" in
        "cleanup")
            cleanup
            exit 0
            ;;
        "status")
            show_status
            exit 0
            ;;
        "health")
            health_check
            exit $?
            ;;
    esac
    
    # Run deployment steps
    check_docker
    check_env_file
    cleanup
    deploy
    
    # Wait and perform health checks
    if health_check; then
        show_status
        log_info "Deployment completed successfully! 🚀"
        
        # Show logs for debugging
        echo ""
        log_info "To view logs, run:"
        log_info "docker-compose logs -f"
        
    else
        log_error "Deployment failed during health checks"
        log_info "Check logs with: docker-compose logs"
        exit 1
    fi
}

# Run main function
main "$@"