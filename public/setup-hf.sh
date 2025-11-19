#!/bin/bash

# HF Spaces Quick Setup Script
# This script helps set up environment variables for HF Spaces deployment

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     HF Spaces - AI Agent Setup Helper                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if running in HF Spaces environment
if [ -z "$SPACE_ID" ]; then
    echo "⚠️  Warning: Not running in HF Spaces environment"
    echo "This script should be run from HF Spaces terminal"
    echo ""
fi

echo "Required Environment Variables:"
echo "================================"
echo ""
echo "1. GEMINI_API_KEY"
echo "   - Get from: https://makersuite.google.com/app/apikey"
echo "   - Add to HF Space Secrets"
echo ""

echo "2. GitHub Authentication (Choose ONE):"
echo ""
echo "   Option A: Personal Access Token"
echo "   - GITHUB_TOKEN: https://github.com/settings/tokens"
echo ""
echo "   Option B: GitHub App (Recommended)"
echo "   - GH_APP_ID: Your GitHub App ID"
echo "   - GH_APP_PRIVATE_KEY_B64: Base64 encoded private key"
echo "   - GH_APP_INSTALLATION_ID: App installation ID"
echo ""

echo "3. Hugging Face Configuration"
echo "   - HF_TOKEN: https://huggingface.co/settings/tokens"
echo "   - HF_USERNAME: Your HF username"
echo "   - HF_SPACE_NAME: This space's name"
echo ""

echo "4. Optional Configuration"
echo "   - ENABLE_AUTO_FIX: true/false (auto-scan for issues)"
echo "   - SCAN_INTERVAL: milliseconds between scans (default: 3600000)"
echo "   - NODE_ENV: production/development"
echo ""

echo "Setup Instructions:"
echo "==================="
echo "1. Go to Settings → Secrets"
echo "2. Add each variable with its value"
echo "3. Click Save"
echo "4. Space will restart with new configuration"
echo ""

echo "Verification:"
echo "============="
echo ""
echo "Check if server is running:"
echo "  curl http://localhost:7860/health"
echo ""
echo "View application logs:"
echo "  tail -f /tmp/*.log"
echo ""

echo "✓ Setup complete! Your AI Agent is ready."
