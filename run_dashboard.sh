#!/bin/bash
# Startup script for Smart Shopping Dashboard

echo "🛍️  Starting Smart Shopping Dashboard..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Create necessary directories
mkdir -p uploads static templates

# Start the Flask server
echo ""
echo "✅ Dashboard starting at http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo ""
python app.py

