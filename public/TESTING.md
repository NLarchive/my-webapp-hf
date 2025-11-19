# AI Agent Testing Guide

## Quick Start Test

### 1. Local Testing (Before HF Deployment)

```bash
# Install dependencies
cd public
npm install

# Create .env file with test values
cp .env.example .env
# Edit .env with your API keys

# Start the server
npm start
# Server will run on http://localhost:7860

# In another terminal, run tests
node scripts/test-ai-agent.js
```

### 2. Expected Test Results

The test suite validates:
- ✓ **Health Check**: Server responds to health endpoint
- ✓ **Project Scanning**: AI scans project structure for issues
- ✓ **Documentation Generation**: Auto-generates project documentation
- ✓ **README Generation**: Creates comprehensive README
- ✓ **Chat Interface**: Gemini AI responds to chat messages
- ✓ **Scanner Reports**: Retrieves scan history

---

## Testing Scenario: Auto-Modification Features

### Test Case 1: Project Documentation

**What it does:**
- Analyzes project structure
- Generates documentation about files and directories
- Provides insights about the codebase

**Test:**
```bash
curl -X POST http://localhost:7860/api/docs/project \
  -H "Content-Type: application/json"
```

**Expected Output:**
```json
{
  "success": true,
  "documentation": "Project overview, directory explanation, getting started...",
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

---

### Test Case 2: Automatic Issue Detection

**What it does:**
- Scans for missing critical files (package.json, README, Dockerfile)
- Detects dependency issues
- Identifies documentation gaps

**Test:**
```bash
curl -X POST http://localhost:7860/api/scanner/scan \
  -H "Content-Type: application/json"
```

**Expected Output:**
```json
{
  "success": true,
  "report": {
    "timestamp": "2025-11-19T10:30:00.000Z",
    "duration": 2345,
    "structure": {
      "files": [...],
      "directories": [...]
    },
    "issues": [...],
    "analysis": {...},
    "recommendations": [...]
  }
}
```

---

### Test Case 3: README Auto-Generation

**What it does:**
- Creates professional README with sections:
  - Project description
  - Features
  - Installation
  - Configuration
  - API documentation
  - Architecture

**Test:**
```bash
curl -X POST http://localhost:7860/api/docs/readme \
  -H "Content-Type: application/json"
```

**Expected Output:**
```json
{
  "success": true,
  "readme": "# Project Name\n\nDescr..."
}
```

---

### Test Case 4: File-Specific Documentation

**What it does:**
- Analyzes individual source files
- Generates documentation about functions and exports
- Provides usage examples

**Test:**
```bash
curl -X POST http://localhost:7860/api/docs/file \
  -H "Content-Type: application/json" \
  -d '{"filePath": "src/server.js"}'
```

---

### Test Case 5: Chat-Based Assistance

**What it does:**
- Accepts natural language questions
- Provides AI-powered responses about code
- Explains architecture and functionality

**Test:**
```bash
curl -X POST http://localhost:7860/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"message": "What does the scanner agent do?"}'
```

---

## Testing on Hugging Face Spaces

### Prerequisites
1. Create HF Space (Settings → Secrets)
2. Add these secrets:
   - `HF_TOKEN`: Your HF write token
   - `HF_USERNAME`: Your HF username
   - `HF_SPACE_NAME`: Your space name
   - `GEMINI_API_KEY`: Your Gemini API key
   - `GH_APP_ID`: GitHub App ID (if using GitHub App)
   - `GH_APP_PRIVATE_KEY_B64`: Base64 private key
   - `GH_APP_INSTALLATION_ID`: App installation ID

### Testing Steps

1. **Push to GitHub** (auto-syncs to HF):
   ```bash
   git push origin main
   ```

2. **Check HF Space** (wait 2-3 minutes for sync):
   - Go to your HF Space
   - Check "Logs" tab for deployment status

3. **Test Health Endpoint**:
   ```bash
   curl https://{username}-{space-name}.hf.space/health
   ```

4. **Test Scanner**:
   ```bash
   curl -X POST https://{username}-{space-name}.hf.space/api/scanner/scan
   ```

5. **Test Chat**:
   - Open the web interface at `https://{username}-{space-name}.hf.space`
   - Type a message and chat with the AI

---

## Expected Behaviors

### On First Scan
- Project structure is analyzed
- Documentation is generated
- Issues are detected
- Recommendations are provided

### Periodic Scanning
- If `ENABLE_AUTO_FIX=true`, scans run every hour (configurable)
- Results are logged to console
- GitHub issues are created for critical problems

### Documentation Generation
- Auto-generates for missing documentation
- Updates can be reviewed in GitHub issues
- Helps team understand codebase

---

## Troubleshooting

### Health Check Fails
```bash
# Check if port 7860 is available
# Check server logs for startup errors
# Verify all environment variables are set
```

### Chat API Returns Error
```bash
# Check GEMINI_API_KEY is valid
# Check API quota isn't exceeded
# Verify network connectivity
```

### GitHub Issues Not Created
```bash
# Verify GitHub authentication (GITHUB_TOKEN or GitHub App)
# Check GITHUB_REPO and GITHUB_OWNER are correct
# Verify app has repository permissions
```

### Scanner Doesn't Run
```bash
# Check ENABLE_AUTO_FIX=true
# Verify project is accessible from API
# Check logs for detailed error messages
```

---

## Manual Testing Checklist

- [ ] Health endpoint responds with status
- [ ] Project structure is retrieved correctly
- [ ] Documentation generates without errors
- [ ] README is created with proper formatting
- [ ] Chat responds to user messages
- [ ] Scanner detects project issues
- [ ] Reports include recommendations
- [ ] On HF Space: Web UI loads
- [ ] On HF Space: Chat accepts input
- [ ] On HF Space: All endpoints are accessible

---

## Advanced Testing

### Load Testing
```bash
# Test concurrent requests
for i in {1..5}; do
  curl -X POST http://localhost:7860/api/scanner/scan &
done
wait
```

### API Response Time
```bash
# Measure endpoint performance
time curl -X POST http://localhost:7860/api/docs/project
```

### Memory Usage
```bash
# Monitor while running tests
watch -n 1 'ps aux | grep node'
```

---

## Success Criteria

✅ **Basic Functionality**
- Server starts without errors
- All endpoints respond with valid JSON
- Health check returns status

✅ **AI Features**
- Scanner finds project structure
- Documentation generates meaningful content
- Chat AI responds appropriately
- Recommendations are actionable

✅ **GitHub Integration**
- Can authenticate to GitHub
- Can read repository contents
- Can create issues (if configured)

✅ **HF Deployment**
- Docker builds successfully
- Application runs on HF Space
- Web UI is accessible
- All features work on remote instance

---

## Next Steps

1. ✅ Complete GitHub App setup
2. ✅ Deploy to HF Space
3. ✅ Run test suite
4. ✅ Monitor logs for errors
5. ✅ Test with real projects
6. 📋 Create CI/CD pipeline
7. 📋 Add webhook integration
8. 📋 Implement auto-fixes
