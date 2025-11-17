@echo off
REM Startup script for AI Agent (Windows)
setlocal enabledelayedexpansion

REM Set environment defaults
if not defined NODE_ENV set NODE_ENV=production
if not defined PORT set PORT=3000

REM Check for required environment variables
if not defined GEMINI_API_KEY (
    echo WARNING: GEMINI_API_KEY not set. Chat will not work.
)

if not defined GITHUB_TOKEN (
    echo WARNING: GITHUB_TOKEN not set. GitHub integration will not work.
)

REM Set defaults if not provided
if not defined GITHUB_REPO set GITHUB_REPO=NLarchive/my-webapp-hf
if not defined GITHUB_OWNER set GITHUB_OWNER=NLarchive
if not defined GITHUB_BRANCH set GITHUB_BRANCH=main
if not defined SCAN_INTERVAL set SCAN_INTERVAL=3600000
if not defined ENABLE_AUTO_FIX set ENABLE_AUTO_FIX=true
if not defined LOG_LEVEL set LOG_LEVEL=info

echo Starting AI Agent...
echo   PORT: %PORT%
echo   NODE_ENV: %NODE_ENV%
echo   GITHUB_REPO: %GITHUB_REPO%
echo   SCAN_INTERVAL: %SCAN_INTERVAL%ms

REM Start the server
node src/server.js
