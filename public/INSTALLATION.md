# AI Agent - Installation & Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Environment Setup](#environment-setup)
3. [HF Spaces Deployment](#hf-spaces-deployment)
4. [API Configuration](#api-configuration)
5. [Troubleshooting](#troubleshooting)

## Local Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Text editor (VS Code recommended)

### Step 1: Install Dependencies

```bash
cd public
npm install
```

This installs:
- Express.js (web server)
- @google/generative-ai (Gemini SDK)
- axios (HTTP client)
- cors & body-parser (middleware)
- dotenv (environment management)

### Step 2: Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
GEMINI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
HF_TOKEN=hf_...
GITHUB_REPO=YourUsername/repo-name
GITHUB_OWNER=YourUsername
```

### Step 3: Start Development Server

```bash
npm run dev
```

Output:
```
[INFO] ... - Server started on port 3000
```

Visit: http://localhost:3000

### Step 4: Test the App

1. **Chat**: Open "💬 Chat" tab and try `/help` command
2. **Scanner**: Click "🔍 Run Manual Scan"
3. **Project**: View "📁 Project" structure

## Environment Setup

### Getting API Keys

#### 1. Google Gemini API Key
```
1. Go: https://makersuite.google.com/app/apikey
2. Click "Create API key"
3. Copy the key
4. Paste into .env GEMINI_API_KEY=
```

#### 2. GitHub Authentication (Choose One)

**Option A: Personal Access Token (Simple)**
```
1. Go: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "ai-agent-hf"
4. Select scopes:
   ✓ repo (full access)
   ✓ workflow (update GitHub Actions)
   ✓ gist (optional)
5. Generate and copy
6. Paste into .env GITHUB_TOKEN=
```

**Option B: GitHub App (Recommended for Production)**
```
1. Go: https://github.com/settings/apps
2. Click "New GitHub App"
3. Configure:
   - Name: "AI Agent HF"
   - Homepage URL: https://huggingface.co/spaces/YourUsername/your-space
   - Webhook URL: Leave empty
   - Permissions:
     ✓ Repository permissions → Contents: Read & write
     ✓ Repository permissions → Issues: Read & write
     ✓ Repository permissions → Pull requests: Read & write
     ✓ Repository permissions → Actions: Read & write
     ✓ Repository permissions → Metadata: Read
4. Generate private key (download .pem file)
5. Install app on your repository
6. Get installation ID from app settings
7. Convert private key to base64:
   ```bash
   # On Windows PowerShell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\private-key.pem"))
   ```
8. Configure .env:
   ```
   GH_APP_ID=your_app_id
   GH_APP_PRIVATE_KEY_B64=your_base64_private_key
   GH_APP_INSTALLATION_ID=your_installation_id
   ```
9. Test authentication:
   ```bash
   cd scripts
   node test-github-auth.js
   ```
```

#### 3. Hugging Face Token
```
1. Go: https://huggingface.co/settings/tokens
2. Create new token
3. Name: "ai-agent"
4. Type: "read"
5. Copy token
6. Paste into .env HF_TOKEN=
```

### Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| GEMINI_API_KEY | ✓ | sk-... | Google Gemini API key |
| GITHUB_TOKEN | ✓ | ghp_... | GitHub Personal Access Token |
| HF_TOKEN | ✓ | hf_... | Hugging Face API token |
| GITHUB_REPO | ✓ | user/repo | GitHub repository |
| GITHUB_OWNER | ✓ | user | GitHub username |
| GITHUB_BRANCH | ✓ | main | Default branch |
| SCAN_INTERVAL | - | 3600000 | Scanner interval (ms) |
| ENABLE_AUTO_FIX | - | true | Enable auto-fixing |
| AUTO_COMMIT | - | false | Auto-commit fixes |
| PORT | - | 3000 | Server port |
| LOG_LEVEL | - | info | Logging level |

## HF Spaces Deployment

### Prerequisites
- HF Space created on Hugging Face
- GitHub repository connected
- All environment variables set in GitHub Secrets

### Step 1: Update Dockerfile

The `Dockerfile` is already configured for HF Spaces (port 7860).

Verify it exists in project root:
```
D:\mcp\mcp-2hackathon\Dockerfile
```

### Step 2: Update GitHub Actions Workflow

Update `.github/workflows/sync-to-hf.yml`:

```yaml
name: Sync to HF Space
on:
  push:
    branches: [main]
    paths:
      - 'public/**'
      - 'Dockerfile'
      - '.github/workflows/sync-to-hf.yml'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Push to HF Space
        run: |
          git remote add hf https://${{ secrets.HF_USERNAME }}:${{ secrets.HF_TOKEN }}@huggingface.co/spaces/${{ secrets.HF_USERNAME }}/${{ secrets.HF_SPACE_NAME }}
          git push hf HEAD:main --force
```

### Step 3: Set GitHub Secrets

In GitHub repo → Settings → Secrets and variables → Actions:

1. **HF_TOKEN**
   - Value: Your HF token
   - Use the token from HF Settings

2. **HF_USERNAME**
   - Value: Your HF username
   - Example: `NLarchive`

3. **HF_SPACE_NAME**
   - Value: Your HF Space name
   - Example: `my-webapp-hf`

4. **GEMINI_API_KEY** (optional, if using in GitHub Actions)

5. **GITHUB_TOKEN** (GitHub provides automatically)

### Step 4: Deploy

```bash
# Commit and push changes
git add .
git commit -m "feat: add ai agent to hf space"
git push origin main
```

GitHub Actions will automatically:
1. Build Docker image
2. Push to HF Space
3. Start the service on HF Spaces

Access at: `https://huggingface.co/spaces/YourUsername/your-space`

## API Configuration

### Base URL
- Local: `http://localhost:3000`
- HF Spaces: `https://huggingface.co/spaces/YourUsername/your-space`

### Authentication
All API calls include `Content-Type: application/json` header.

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-17T...",
  "uptime": 123.45
}
```

### Example: Send Chat Message

```bash
# 1. Start conversation
curl -X POST http://localhost:3000/api/chat/start

# Response:
# {
#   "success": true,
#   "sessionId": "session_1234_xyz"
# }

# 2. Send message
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_1234_xyz",
    "message": "What is this project?"
  }'

# Response:
# {
#   "success": true,
#   "response": "Based on your project structure..."
# }
```

### Example: Run Scanner

```bash
curl -X POST http://localhost:3000/api/scanner/scan

# Response:
# {
#   "success": true,
#   "report": {
#     "timestamp": "...",
#     "duration": 1234,
#     "issues": [...],
#     "analysis": {...},
#     "recommendations": [...]
#   }
# }
```

## Troubleshooting

### Port Already in Use
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill the process
Kill-Process -Id <PID> -Force
```

### API Key Invalid
```
Error: API key not valid
```

Solution:
1. Verify key in `.env` file
2. Check key hasn't expired
3. Test key directly: `curl https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=YOUR_KEY`

### GitHub Connection Failed
```
Error: Failed to create GitHub issue
```

Solution:
1. Verify `GITHUB_TOKEN` in `.env`
2. Check token has `repo` and `issues` scope
3. Verify `GITHUB_REPO` format: `owner/repo`

### Scanner Not Running
```
Scan failed: ...
```

Solution:
1. Check `ENABLE_AUTO_FIX=true` in `.env`
2. Verify GitHub token and permissions
3. Check server logs: `npm run dev` (development mode shows detailed logs)

### Slow Responses
```
Chat timeout or slow responses
```

Solutions:
1. Check internet connection
2. Verify API keys are valid
3. Increase timeout: Edit `src/config/env.js` → increase timeouts
4. Use simpler prompts to reduce processing time

### HF Space Build Failing

Check logs:
```
GitHub → Actions → View workflow run → HF Space build logs
```

Common issues:
- `npm install` failing: Check `package.json` syntax
- Port 7860 not exposed: Verify `Dockerfile` EXPOSE 7860
- Environment variables missing: Check GitHub Secrets

### Local Testing Before Deployment

```bash
# 1. Test with Docker locally
docker build -t ai-agent .
docker run -p 3000:7860 \
  -e GEMINI_API_KEY=your_key \
  -e GITHUB_TOKEN=your_token \
  ai-agent

# 2. Access at http://localhost:3000

# 3. Check container logs
docker logs <container_id>
```

## Next Steps

1. ✅ Set up local environment
2. ✅ Configure API keys
3. ✅ Test locally
4. ✅ Deploy to HF Spaces
5. 🔄 Monitor scanner results
6. 🔄 Collect user feedback
7. 🔄 Add custom scanners/commands

## Support & Resources

- **Google Gemini**: https://ai.google.dev/
- **GitHub API**: https://docs.github.com/en/rest
- **HF Spaces**: https://huggingface.co/docs/hub/spaces
- **Node.js**: https://nodejs.org/docs/

---

**Last Updated**: November 17, 2024
