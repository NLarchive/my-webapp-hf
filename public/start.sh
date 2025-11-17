#!/bin/bash
# Startup script for AI Agent on HF Spaces

# Set environment defaults
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-7860}

# Add required environment variables with defaults
# These MUST be set in GitHub Secrets or HF Space Secrets before deployment
if [ -z "$GEMINI_API_KEY" ]; then
    echo "WARNING: GEMINI_API_KEY not set. Chat will not work."
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "WARNING: GITHUB_TOKEN not set. GitHub integration will not work."
fi

if [ -z "$HF_TOKEN" ]; then
    echo "WARNING: HF_TOKEN not set. HF integration will not work."
fi

# Set defaults if not provided
export GITHUB_REPO=${GITHUB_REPO:-NLarchive/my-webapp-hf}
export GITHUB_OWNER=${GITHUB_OWNER:-NLarchive}
export GITHUB_BRANCH=${GITHUB_BRANCH:-main}
export HF_SPACE_NAME=${HF_SPACE_NAME:-my-webapp-hf}
export SCAN_INTERVAL=${SCAN_INTERVAL:-3600000}
export ENABLE_AUTO_FIX=${ENABLE_AUTO_FIX:-true}
export AUTO_COMMIT=${AUTO_COMMIT:-false}
export LOG_LEVEL=${LOG_LEVEL:-info}

echo "Starting AI Agent..."
echo "  PORT: $PORT"
echo "  NODE_ENV: $NODE_ENV"
echo "  GITHUB_REPO: $GITHUB_REPO"
echo "  SCAN_INTERVAL: ${SCAN_INTERVAL}ms"
echo "  ENABLE_AUTO_FIX: $ENABLE_AUTO_FIX"

# Start the server
cd /app
node src/server.js
