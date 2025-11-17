# AI Agent Architecture & Microservices Design

## Overview

The AI Agent is built as a modular microservices system with clear separation of concerns. Each component is independently testable and can be extended without affecting others.

## Core Components

### 1. Services Layer (`src/services/`)

Services are stateless, reusable modules that handle specific functionality.

#### **Gemini Service** (`gemini.js`)
- Purpose: Handle all Google Generative AI interactions
- Methods:
  - `generate(prompt, options)` - Single-turn generation
  - `chat(message)` - Multi-turn conversation
  - `analyzeCode(code, language)` - Code analysis with structured output
  - `generateCommitMessage(changes)` - Create semantic commit messages
  - `clearHistory()` - Reset conversation state

Example:
```javascript
import { geminiService } from './services/gemini.js';

const analysis = await geminiService.analyzeCode(code, 'javascript');
const response = await geminiService.chat("What does this function do?");
```

#### **GitHub Service** (`github.js`)
- Purpose: GitHub API integration
- Methods:
  - `createIssue(issue)` - Create GitHub issue
  - `createPullRequest(pr)` - Create PR
  - `getFileContents(path)` - Read file from repo
  - `listFiles(path)` - List directory contents
  - `triggerWorkflow(workflowId, inputs)` - Trigger GitHub Actions
  - `getRepoInfo()` - Repository metadata
  - `listIssues(state)` - Get open/closed issues
  - `addIssueComment(issueNumber, body)` - Comment on issue

Example:
```javascript
import { githubService } from './services/github.js';

const issue = await githubService.createIssue({
  title: "Bug: Login fails",
  body: "Steps to reproduce...",
  labels: ['bug', 'critical']
});
```

#### **Project Service** (`project.js`)
- Purpose: Project analysis and exploration
- Methods:
  - `getProjectStructure()` - Files and directories
  - `getFileContent(path)` - Read specific file
  - `scanForIssues()` - Automated issue detection
  - `getReadme()` - README.md content
  - `getDockerfile()` - Dockerfile content
  - `getSourceFiles()` - List programming files

Example:
```javascript
import { projectService } from './services/project.js';

const issues = await projectService.scanForIssues();
const readme = await projectService.getReadme();
```

### 2. Agents Layer (`src/agents/`)

Agents orchestrate multiple services to accomplish complex tasks.

#### **Scanner Agent** (`scanner.js`)
- Purpose: Periodic project analysis and remediation
- Workflow:
  1. Get project structure
  2. Scan for issues
  3. Analyze critical files with AI
  4. Generate recommendations
  5. Create GitHub issues if enabled

Key Methods:
```javascript
scannerAgent.startPeriodicScanning()  // Begin hourly scans
scannerAgent.performScan()            // One-time full scan
scannerAgent.getLastScan()            // Get last report
```

Example Flow:
```
[Scan Triggered]
  ↓
[Get Project Structure] → GitHub Service
  ↓
[Detect Issues] → Project Service
  ↓
[AI Analysis] → Gemini Service
  ↓
[Generate Recommendations] → Gemini Service
  ↓
[Create Issue] → GitHub Service (if enabled)
```

#### **Chat Agent** (`chat.js`)
- Purpose: Multi-turn conversation management
- Workflow:
  1. Start conversation session
  2. Maintain context about project
  3. Process commands or queries
  4. Generate AI responses
  5. Track conversation history

Key Methods:
```javascript
chatAgent.startConversation(sessionId)    // Initialize session
chatAgent.processMessage(sessionId, msg)  // Handle user input
chatAgent.getHistory(sessionId)           // Get conversation
chatAgent.clearConversation(sessionId)    // End session
```

Commands:
```
/scan      → Trigger project scan
/status    → Get repository status
/issues    → List open issues
/help      → Show available commands
```

### 3. API Routes (`src/api/`)

Express routes that expose services and agents via HTTP.

#### **Chat Routes** (`chat.js`)
```
POST   /api/chat/start                      # Initialize session
POST   /api/chat/message                    # Send message
GET    /api/chat/history/:sessionId         # Get conversation
DELETE /api/chat/clear/:sessionId           # Clear conversation
GET    /api/chat/stats                      # Chat statistics
```

#### **Scanner Routes** (`scanner.js`)
```
POST /api/scanner/scan                      # Manual scan
GET  /api/scanner/last-report               # Last report
GET  /api/scanner/issues                    # Current issues
POST /api/scanner/start-continuous          # Start auto-scanning
POST /api/scanner/stop-continuous           # Stop auto-scanning
```

#### **Project Routes** (`project.js`)
```
GET /api/project/structure                  # Project layout
GET /api/project/file?path=...             # File content
GET /api/project/readme                     # README.md
GET /api/project/dockerfile                 # Dockerfile
GET /api/project/source-files               # Source files list
```

### 4. Configuration & Utilities

#### **Environment Config** (`config/env.js`)
- Centralized configuration management
- Validates required variables at startup
- Type-safe environment access

```javascript
import { config, validateConfig } from './config/env.js';

console.log(config.GEMINI_API_KEY);
validateConfig();  // Throws if missing required vars
```

#### **Logger** (`config/logger.js`)
- Structured logging with levels
- Timestamp and context support
- Configurable verbosity

```javascript
import { logger } from './config/logger.js';

logger.info('Something happened', { details: {...} });
logger.error('Failed', { error: err.message });
logger.debug('Debug info', { data });
```

#### **Task Runner** (`utils/taskRunner.js`)
- Task queue execution with retry logic
- Priority-based ordering
- Timeout management
- Execution history

```javascript
import { taskRunner } from './utils/taskRunner.js';

taskRunner.addTask({
  id: 'analyze-code',
  name: 'Analyze codebase',
  priority: 10,
  execute: async () => { /* task code */ },
  retries: 3,
  timeout: 30000
});

const results = await taskRunner.runAll();
```

## Data Flow Diagrams

### Chat Flow
```
User Input
    ↓
[Chat API] POST /api/chat/message
    ↓
[Chat Agent] processMessage()
    ↓
Load Project Context? → [Project Service] getProjectStructure()
    ↓
Is Command? (/scan, /status, etc)
    ├─ Yes → Execute specific handler
    │         └─ May call GitHub Service
    │
    └─ No → [Gemini Service] chat()
            └─ Multi-turn conversation
    ↓
[Chat Agent] Store in history
    ↓
Return Response to Client
    ↓
Update Chat UI
```

### Scanner Flow
```
[Timer] Every SCAN_INTERVAL
    ↓
[Scanner Agent] performScan()
    ↓
[Project Service] getProjectStructure()
    ↓
[Project Service] scanForIssues()
    ↓
[Gemini Service] analyzeCode() (per file)
    ↓
[Gemini Service] generateRecommendations()
    ↓
[Create Report]
    ↓
Issues Found + AUTO_FIX enabled?
    ├─ Yes → [GitHub Service] createIssue()
    └─ No  → [Store Report]
    ↓
Return Report to Client
```

### Request Flow
```
Browser Client
    ↓
JavaScript fetch() → API Request
    ↓
[Express Router]
    ├─ Parse request
    ├─ Call service/agent
    ├─ Handle errors
    └─ Return JSON response
    ↓
Client Updates UI
```

## Extension Points

### Adding a New Scanner

1. Create analyzer in `src/agents/scanner.js`:

```javascript
async analyzeProject() {
  const sourceFiles = await projectService.getSourceFiles();
  const analysis = {
    files: [],
    overallHealth: 'unknown',
  };

  for (const file of sourceFiles.slice(0, 5)) {
    try {
      const content = await projectService.getFileContent(file.path);
      // YOUR CUSTOM ANALYSIS HERE
      const customAnalysis = await your_analysis(content);
      analysis.files.push({
        name: file.name,
        analysis: customAnalysis,
      });
    } catch (e) {
      logger.warn(`Failed to analyze ${file.name}`);
    }
  }

  return analysis;
}
```

2. Results appear in scan reports and recommendations.

### Adding a New Command

1. Extend `src/agents/chat.js`:

```javascript
async handleMessage(message, context) {
  if (message.startsWith('/mycommand')) {
    return this.handleMyCommand(context);
  }
  // ... existing code
}

async handleMyCommand(context) {
  // Your command logic
  return "Command result";
}
```

2. Add to `/help` text:

```javascript
getHelpText() {
  return `
    /mycommand - Description of what it does
    ...existing commands...
  `;
}
```

### Adding a New API Endpoint

1. Create route in `src/api/newfeature.js`:

```javascript
import express from 'express';
import { someService } from '../services/some.js';

const router = express.Router();

router.get('/endpoint', async (req, res) => {
  try {
    const result = await someService.doSomething();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

2. Mount in `src/server.js`:

```javascript
import newFeatureRoutes from './api/newfeature.js';

app.use('/api/newfeature', newFeatureRoutes);
```

## Performance Considerations

### Caching
- Project structure: 5-minute cache
- File contents: On-demand (no cache)
- API responses: Browser cache (Cache-Control headers)

### Optimization
- Analyze only first 5 source files
- Limit file size for AI analysis
- Use pagination for large lists
- Compress API responses

### Scaling
- Separate scanner into background job
- Use message queue for long-running tasks
- Cache expensive computations
- Add rate limiting for API endpoints

## Testing

Each component can be tested independently:

```javascript
// Test Gemini Service
const response = await geminiService.analyzeCode(code, 'javascript');
assert(response.issues !== undefined);

// Test GitHub Service
const issue = await githubService.createIssue({
  title: 'Test',
  body: 'Test body'
});
assert(issue.number !== undefined);

// Test Project Service
const structure = await projectService.getProjectStructure();
assert(structure.files.length > 0);

// Test Chat Agent
const session = chatAgent.startConversation('test-session');
assert(session.sessionId === 'test-session');
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│      Hugging Face Space (Docker)        │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │    Express Server (Port 7860)     │  │
│  ├───────────────────────────────────┤  │
│  │  Static Files (HTML/CSS/JS)       │  │
│  ├───────────────────────────────────┤  │
│  │  API Routes                       │  │
│  │  ├─ /api/chat                     │  │
│  │  ├─ /api/scanner                  │  │
│  │  └─ /api/project                  │  │
│  ├───────────────────────────────────┤  │
│  │  Agents                           │  │
│  │  ├─ Chat Agent (sessions)         │  │
│  │  └─ Scanner Agent (periodic)      │  │
│  ├───────────────────────────────────┤  │
│  │  Services                         │  │
│  │  ├─ Gemini Service                │  │
│  │  ├─ GitHub Service                │  │
│  │  └─ Project Service               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │
         ├─→ [Google Gemini API]
         ├─→ [GitHub API]
         └─→ [Hugging Face API]
```

## Security Best Practices

1. **Environment Variables**: Never log or expose API keys
2. **Input Validation**: Sanitize all user inputs
3. **Error Handling**: Don't expose stack traces in production
4. **Rate Limiting**: Add per-IP or per-session limits
5. **Token Rotation**: Regularly refresh API tokens
6. **Logging**: Log security-relevant events

---

**Architecture Version**: 1.0.0
**Last Updated**: November 17, 2024
