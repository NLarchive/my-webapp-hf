# AI Agent for HF Spaces

A modular, scalable AI agent system that runs on Hugging Face Spaces with:
- **Periodic Issue Scanner** - Scans your project hourly for issues and suggests fixes
- **Chat Interface** - Talk to Gemini AI about your project in real-time
- **GitHub Integration** - Creates issues and PRs automatically
- **Microservices Architecture** - Modular, maintainable, extensible

## Features

### 🤖 AI Chat Agent
- Multi-turn conversations with Google Gemini
- Context-aware responses about your project
- Commands: `/scan`, `/status`, `/issues`, `/help`
- Session management and conversation history

### 🔍 Project Scanner
- Hourly automated scans (configurable interval)
- Detects:
  - Missing critical files
  - Security issues (exposed .env, etc)
  - Code quality problems
  - Dependency vulnerabilities
- AI-powered recommendations
- Auto-creates GitHub issues for critical findings

### 📁 Project Explorer
- View project structure
- Display README.md
- Show Dockerfile
- List source files with language detection

### 🔗 GitHub Integration
- Read repository structure
- Create issues from scan results
- Create pull requests with fixes
- Trigger GitHub Actions workflows
- List open issues

## Architecture

```
public/
├── src/
│   ├── server.js                 # Express server entry point
│   ├── config/
│   │   ├── env.js               # Configuration management
│   │   └── logger.js            # Logging service
│   ├── services/
│   │   ├── gemini.js            # Google Generative AI service
│   │   ├── github.js            # GitHub API service
│   │   └── project.js           # Project analysis service
│   ├── agents/
│   │   ├── scanner.js           # Periodic scanner agent
│   │   └── chat.js              # Chat agent
│   ├── api/
│   │   ├── chat.js              # Chat routes
│   │   ├── scanner.js           # Scanner routes
│   │   └── project.js           # Project routes
│   └── utils/
│       └── taskRunner.js        # Task execution framework
├── assets/
│   ├── css/
│   │   └── styles.css           # Responsive UI styles
│   └── js/
│       ├── app.js               # Main app initialization
│       └── modules/
│           ├── chat.js          # Chat UI manager
│           ├── scanner.js       # Scanner UI manager
│           ├── project.js       # Project UI manager
│           ├── ui.js            # UI utilities
│           └── api-client.js    # HTTP client
├── index.html                    # Main UI
└── package.json                  # Dependencies
```

## Installation & Setup

### 1. Prerequisites
- Node.js 18+
- Google Gemini API Key
- GitHub Token (Personal Access Token)
- Docker (for HF Spaces deployment)

### 2. Environment Variables

Create a `.env` file in the `public/` directory:

```bash
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_token_here
HF_TOKEN=your_hugging_face_token_here

# GitHub Configuration
GITHUB_REPO=YourUsername/your-repo
GITHUB_OWNER=YourUsername
GITHUB_BRANCH=main

# HF Space Configuration
HF_SPACE_NAME=your-space-name
HF_SPACE_URL=https://huggingface.co/spaces/YourUsername/your-space

# Scanner Configuration (milliseconds)
SCAN_INTERVAL=3600000  # 1 hour
ENABLE_AUTO_FIX=true
AUTO_COMMIT=false

# Server
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
DEBUG=false
```

### 3. Install Dependencies

```bash
cd public
npm install
```

### 4. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

### 5. Access the App

Open http://localhost:3000 in your browser

## API Endpoints

### Chat API
- `POST /api/chat/start` - Start new conversation
- `POST /api/chat/message` - Send message and get response
- `GET /api/chat/history/:sessionId` - Get conversation history
- `DELETE /api/chat/clear/:sessionId` - Clear conversation
- `GET /api/chat/stats` - Get chat statistics

### Scanner API
- `POST /api/scanner/scan` - Trigger manual scan
- `GET /api/scanner/last-report` - Get last scan report
- `GET /api/scanner/issues` - Get detected issues
- `POST /api/scanner/start-continuous` - Start continuous scanning
- `POST /api/scanner/stop-continuous` - Stop continuous scanning

### Project API
- `GET /api/project/structure` - Get project structure
- `GET /api/project/file?path=<filepath>` - Get file content
- `GET /api/project/readme` - Get README
- `GET /api/project/dockerfile` - Get Dockerfile
- `GET /api/project/source-files` - List source files

## Usage Examples

### Chat with AI
1. Navigate to "Chat" tab
2. Ask questions:
   - "What are the main components?"
   - "How do I deploy this?"
   - "Analyze the Dockerfile"
3. Use commands:
   - `/scan` - Run project scan
   - `/status` - Get repo status
   - `/issues` - List open issues
   - `/help` - Show available commands

### Periodic Scanning
1. Navigate to "Scanner" tab
2. Click "Start Auto-Scan (1 hour)" to enable hourly scans
3. Or click "Run Manual Scan" for immediate scan
4. View detected issues and recommendations
5. Scanner auto-creates GitHub issues for critical findings

### Project Exploration
1. Navigate to "Project" tab
2. View directory structure
3. Read project documentation
4. Examine Dockerfile configuration

## Docker Deployment (HF Spaces)

The project includes a Dockerfile configured for HF Spaces:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY public /app

RUN npm ci --omit=dev

EXPOSE 7860

CMD ["npm", "start"]
```

To deploy to HF Spaces:
1. Push to GitHub
2. GitHub Actions syncs to HF Space automatically
3. HF Space builds Docker image
4. App available at: https://huggingface.co/spaces/YourUsername/your-space

## Security Considerations

✅ **What's Protected:**
- API keys stored in environment variables
- GitHub token in GitHub Secrets
- Conversation history in-memory (not persisted)
- User input sanitization

⚠️ **When Deploying:**
- Never commit `.env` file
- Use strong GitHub tokens with limited scope
- Review auto-fix changes before auto-committing
- Monitor scan results for accuracy

## Performance

- **Chat Response:** ~2-5 seconds (depends on prompt complexity)
- **Project Scan:** ~30-60 seconds (depends on project size)
- **Memory Usage:** ~150-250MB at rest
- **Scanner Interval:** Configurable (default 1 hour)

## Customization

### Add Custom Scanners
Extend `src/agents/scanner.js`:
```javascript
async analyzeProject() {
  // Add custom analysis
}
```

### Add Custom Commands
Extend `src/agents/chat.js`:
```javascript
if (message.startsWith('/custom')) {
  return this.handleCustomCommand();
}
```

### Modify UI
Edit `public/assets/css/styles.css` for theming
Edit `public/index.html` for layout changes

## Troubleshooting

**API Keys Not Working?**
- Verify keys in `.env` file
- Check GitHub Secrets on GitHub Actions

**Scanner Not Running?**
- Check `ENABLE_AUTO_FIX=true` in `.env`
- Verify `SCAN_INTERVAL` is in milliseconds
- Check server logs: `npm run dev`

**Chat Responses Are Slow?**
- Increase timeout in `src/config/env.js`
- Reduce context size in `ChatAgent.buildAIContext()`

**Issues Not Created on GitHub?**
- Verify `GITHUB_TOKEN` has `repo` and `issues` scope
- Check GitHub Secrets configuration

## Development

```bash
# Start in watch mode
npm run dev

# Check server health
curl http://localhost:3000/health

# Run scanner agent directly
node src/agents/scanner.js
```

## License

MIT

## Support

For issues or questions:
1. Check the `/help` command in chat
2. Review project documentation
3. Create an issue on GitHub
