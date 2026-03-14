#!/bin/bash

# Mahallu Frontend - Docker Startup Script
# This script makes it easy to deploy the frontend

set -e

echo "🚀 Mahallu Frontend Docker Deployment"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed: $(docker --version)"
echo "✅ Docker Compose is installed: $(docker-compose --version)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file and set your BACKEND_API_URL"
    echo ""
    echo "Example:"
    echo "  BACKEND_API_URL=https://services.mahallu.com/api"
    echo ""
    read -p "Press Enter to open .env file for editing (or Ctrl+C to exit)..."
    
    # Try to open with available editor
    if command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    elif command -v vi &> /dev/null; then
        vi .env
    else
        echo "Please edit .env file manually with your preferred editor"
        exit 1
    fi
fi

echo ""
echo "🔍 Current configuration:"
cat .env | grep -v "^#" | grep -v "^$"
echo ""

read -p "Is this configuration correct? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please edit .env file and run this script again."
    exit 1
fi

echo ""
echo "🏗️  Building Docker image..."
docker-compose build

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for container to be ready..."
sleep 5

echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📱 Access the application:"
FRONTEND_PORT=$(grep FRONTEND_PORT .env | cut -d '=' -f2 || echo "3000")
echo "   http://localhost:${FRONTEND_PORT}"
echo ""
echo "📋 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop:             docker-compose stop"
echo "   Restart:          docker-compose restart"
echo "   Remove:           docker-compose down"
echo ""
echo "🎉 Happy deploying!"
