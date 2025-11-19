---
title: AI Agent for GitHub Project Management
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: true
short_description: AI-powered project scanner with docs and chat
---

# AI Agent for Hugging Face Spaces

An intelligent AI agent that scans GitHub projects, generates documentation, detects issues, and provides a chat interface - all powered by Google Generative AI (Gemini).

## 🎯 Features

### 🤖 Automated Project Scanning
- Periodically scans project structure
- Detects missing critical files (package.json, README, Dockerfile)
- Identifies potential issues and improvements
- Creates GitHub issues with recommendations

### 📚 Auto-Generated Documentation
- Generates project documentation
- Creates comprehensive README files
- Documents individual source files
- Explains architecture and features

### 💬 AI Chat Interface
- Chat with Gemini AI about your project
- Ask questions about code and architecture
- Get recommendations and insights
- Web-based chat interface

### 🔐 Secure GitHub Integration
- GitHub App authentication (recommended)
- Personal access token fallback
- Read/write repository access
- Automatic workflow integration

## 🛠️ Technology Stack

- **Backend**: Node.js 18+ with Express.js
- **AI**: Google Generative AI (Gemini)
- **GitHub**: Octokit API with GitHub App auth
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Deployment**: Docker on Hugging Face Spaces
- **CI/CD**: GitHub Actions for auto-sync

## 📦 Project Structure

```
.
├── Dockerfile                          # Container configuration
├── .github/workflows/sync-to-hf.yml   # Auto-sync pipeline
├── public/                             # Web server root
│   ├── src/
│   │   ├── server.js                  # Express app entry point
│   │   ├── config/                    # Configuration management
│   │   ├── services/                  # GitHub, Gemini, Project services
│   │   ├── agents/                    # Scanner and Doc Generator agents
│   │   ├── api/                       # REST API endpoints
│   │   └── utils/                     # Utilities (logging, task runner)
│   ├── assets/                        # CSS and JS modules
│   ├── index.html                     # Web UI
│   ├── package.json                   # Node.js dependencies
│   └── INSTALLATION.md                # Setup guide
├── scripts/                            # Utility scripts
│   ├── get-installation-token.js      # GitHub App token generation
│   ├── test-github-auth.js            # Auth validation
│   └── test-ai-agent.js               # Comprehensive test suite
└── README.md                           # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Docker (for containerized deployment)
- Git

### Local Development

1. **Install dependencies**
   ```bash
   cd public
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start the server**
   ```bash
   npm start
   # Server runs on http://localhost:7860
   ```

4. **Run tests**
   ```bash
   # In another terminal
   node scripts/test-ai-agent.js
   ```

### Docker Deployment

```bash
# Build image
docker build -t ai-agent-hf:latest .

# Run container
docker run -p 7860:7860 \
  -e GEMINI_API_KEY=your_key \
  -e GH_APP_ID=your_id \
  -e GH_APP_PRIVATE_KEY_B64=your_key \
  -e GH_APP_INSTALLATION_ID=your_id \
  ai-agent-hf:latest
```

## ⚙️ Configuration

### Environment Variables

**Required:**
- `GEMINI_API_KEY`: Get from https://makersuite.google.com/app/apikey
- **GitHub Auth** (choose one):
  - `GITHUB_TOKEN`: Personal access token (https://github.com/settings/tokens)
  - OR GitHub App:
    - `GH_APP_ID`: Your GitHub App ID
    - `GH_APP_PRIVATE_KEY_B64`: Base64-encoded private key
    - `GH_APP_INSTALLATION_ID`: Installation ID

**Optional:**
- `ENABLE_AUTO_FIX`: Enable periodic scanning (default: false)
- `SCAN_INTERVAL`: Scan interval in ms (default: 3600000 = 1 hour)
- `NODE_ENV`: Environment (default: production)

### GitHub App Setup

See [INSTALLATION.md](public/INSTALLATION.md) for complete GitHub App setup instructions.

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Chat API
```bash
POST /api/chat/send
Content-Type: application/json

{
  "message": "What does this project do?"
}
```

### Scanner API
```bash
POST /api/scanner/scan          # Trigger manual scan
GET /api/scanner/last-report    # Get last scan results
```

### Documentation API
```bash
POST /api/docs/project          # Generate project docs
POST /api/docs/file             # Document specific file
POST /api/docs/readme           # Generate README
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
node scripts/test-ai-agent.js
```

Tests validate:
- ✓ Server health and availability
- ✓ Project scanning functionality
- ✓ Documentation generation
- ✓ Chat interface
- ✓ GitHub integration

See [TESTING.md](public/TESTING.md) for detailed testing documentation.

## 🌐 Hugging Face Spaces Deployment

### Setup

1. Create a new Space on Hugging Face with Docker SDK
2. Add these secrets in Space settings:
   - `HF_TOKEN`: Your HF write token
   - `HF_USERNAME`: Your HF username
   - `HF_SPACE_NAME`: Your space name
   - `GEMINI_API_KEY`: Your Gemini API key
   - GitHub authentication (choose method)

3. Push to GitHub - auto-syncs to HF Space

### Access

- **Web UI**: https://huggingface.co/spaces/{username}/{space-name}
- **Health Check**: https://{username}-{space-name}.hf.space/health
- **API Base**: https://{username}-{space-name}.hf.space/api

## 📖 Documentation

- [INSTALLATION.md](public/INSTALLATION.md) - Detailed setup guide
- [TESTING.md](public/TESTING.md) - Testing procedures
- [ARCHITECTURE.md](public/ARCHITECTURE.md) - System design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push and create a Pull Request

## 📝 License

MIT License - See LICENSE file for details

## 🔗 Links

- **GitHub**: https://github.com/NLarchive/my-webapp-hf
- **Hugging Face**: https://huggingface.co/spaces/NLarchive/my-webapp-hf
- **Google Generative AI**: https://makersuite.google.com

## ⚠️ Important Notes

- Never commit `.env` files with real tokens
- Use GitHub secrets for sensitive values
- Keep private keys encrypted and base64-encoded
- Monitor API usage and quota limits
- Review generated documentation before publishing
