# My Web App - Complete Documentation

A production-ready full-stack web application with HTML, CSS, JavaScript, and PHP 8.2 running on Apache via Docker, auto-synced from GitHub to Hugging Face Spaces.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [GitHub Actions Workflow](#github-actions-workflow)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

This project demonstrates a complete, modular web application deployed on Hugging Face Spaces using Docker. The app features:

- **Static Frontend**: HTML5 with responsive CSS3
- **Interactive UI**: Vanilla JavaScript for dynamic interactions
- **Backend API**: PHP 8.2 running on Apache
- **Containerization**: Docker for consistent deployments
- **CI/CD**: GitHub Actions for automated sync to HF Spaces

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         Hugging Face Spaces                          │
│  (Docker Container running Apache + PHP 8.2)        │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  Public Web Root (/var/www/html)            │    │
│  │  ├── index.html (Main page)                 │    │
│  │  ├── styles.css (Responsive styling)        │    │
│  │  ├── script.js (Client-side logic)          │    │
│  │  ├── api.php (Dynamic content API)          │    │
│  │  └── process.php (Form processing)          │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
         ↑
         │ Auto-sync via GitHub Actions
         │
┌─────────────────────────────────────────────────────┐
│         GitHub Repository                            │
│  (NLarchive/my-webapp-hf)                            │
│                                                      │
│  ├── .github/workflows/sync-to-hf.yml               │
│  ├── Dockerfile                                     │
│  ├── README.md (with HF metadata)                   │
│  └── public/                                        │
│      ├── index.html                                 │
│      ├── styles.css                                 │
│      ├── script.js                                  │
│      ├── api.php                                    │
│      └── process.php                                │
└─────────────────────────────────────────────────────┘
```

---

## Features

✅ **Modular Architecture** - Each file has a single, clear responsibility  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **Dynamic Content** - PHP APIs return JSON for JavaScript to consume  
✅ **Form Processing** - Server-side form validation and response  
✅ **Auto-Deployment** - GitHub Actions syncs code to HF on every push  
✅ **Large File Safety** - Workflow checks for files >10MB  
✅ **Production Ready** - Proper HTTP headers, error handling, security basics  
✅ **Easy Customization** - Add new PHP endpoints or JS features without restructuring  

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | HTML5, CSS3 | Latest |
| Scripting | JavaScript (Vanilla) | ES6+ |
| Backend | PHP | 8.2 |
| Web Server | Apache | Latest (via php:8.2-apache) |
| Containerization | Docker | Latest |
| CI/CD | GitHub Actions | Latest |
| Deployment | Hugging Face Spaces | - |

---

## Project Structure

```
my-webapp-hf/
├── .github/
│   └── workflows/
│       └── sync-to-hf.yml          # GitHub Action: syncs to HF Spaces
├── public/                          # Apache web root
│   ├── index.html                   # Main HTML page
│   ├── styles.css                   # Responsive CSS (1,200+ lines)
│   ├── script.js                    # Client-side JS logic
│   ├── api.php                      # Dynamic content endpoint
│   └── process.php                  # Form processing endpoint
├── Dockerfile                       # Docker configuration (Apache + PHP 8.2)
├── README.md                        # Quick start & HF metadata
├── DOCUMENTATION.md                 # This file (full details)
├── SETUP.md                         # Step-by-step deployment guide
├── .gitignore                       # Git ignore patterns
└── .dockerignore                    # Docker ignore patterns
```

---

## Local Development

### Prerequisites

- Docker and Docker Compose (or Docker Desktop)
- Git
- Code editor (VS Code recommended)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/NLarchive/my-webapp-hf.git
cd my-webapp-hf

# Build the Docker image
docker build -t my-webapp .

# Run the container
docker run --rm -p 7860:7860 my-webapp
```

**Access the app**: http://localhost:7860

### Making Changes

1. Edit files in the `public/` folder
2. Save files
3. Refresh your browser (no restart needed for static/PHP files)

**For Docker changes** (if modifying `Dockerfile`):
```bash
docker build -t my-webapp .
docker run --rm -p 7860:7860 my-webapp
```

---

## Deployment

### Option A: Automatic (Recommended)

Every push to `main` on GitHub triggers auto-sync to Hugging Face:

```bash
git add .
git commit -m "Your changes"
git push origin main
# ✅ GitHub Action automatically syncs to HF Spaces
```

### Option B: Manual Push

```bash
git remote add hf https://huggingface.co/spaces/NLarchive/my-webapp-hf
git push --force hf main
# Username: NLarchive
# Password: Your HF Token
```

### First-Time Setup

1. Create HF Space at https://huggingface.co/spaces
2. Set SDK to **Docker**
3. Get HF token: https://huggingface.co/settings/tokens
4. Add to GitHub secrets: `Settings` → `Secrets and variables` → `Actions` → `New secret` (name: `HF_TOKEN`)

---

## GitHub Actions Workflow

**File**: `.github/workflows/sync-to-hf.yml`

**Triggers**: Every push to `main` branch

**Steps**:
1. Checkout code (with LFS support)
2. Check for files >10MB (prevents LFS issues)
3. Configure git user
4. Push to Hugging Face Space with force update

**Status**: Check at https://github.com/NLarchive/my-webapp-hf/actions

---

## API Endpoints

### `GET /api.php`

Returns server status and metadata.

**Response**:
```json
{
  "message": "PHP is working correctly! ✓",
  "timestamp": "2025-11-17 20:30:00",
  "random": 742,
  "php_version": "8.2.x",
  "server": "Apache/2.4.x (Ubuntu)"
}
```

### `POST /process.php`

Processes form data and returns greeting.

**Parameters**: `name` (string)

**Response**:
```json
{
  "success": true,
  "greeting": "Hello, Sam! Your form was processed by PHP.",
  "timestamp": "2025-11-17 20:30:05",
  "name_length": 3
}
```

---

## Troubleshooting

### GitHub Actions Fails

**Issue**: Workflow shows failure  
**Solution**: Check GitHub Actions logs at https://github.com/NLarchive/my-webapp-hf/actions

Common causes:
- `HF_TOKEN` secret not set (add it to GitHub repo settings)
- Invalid YAML in README front matter (use only `indigo`, `yellow`, `red`, etc.)

### Docker Build Fails Locally

**Issue**: `docker build` returns error  
**Solution**: Ensure Dockerfile syntax is correct:
```bash
docker build --no-cache -t my-webapp .
```

### HF Space Shows 502

**Issue**: "Bad Gateway" error on HF  
**Solution**: 
1. Check build logs at your Space's "Build logs" tab
2. Wait 2–5 minutes (first build takes time)
3. Verify `Dockerfile` is at repo root and `public/` is correctly copied

### PHP Functions Not Found

**Issue**: "Call to undefined function" error  
**Solution**: Verify PHP extension is installed. Check Dockerfile comment for optional extensions.

### Colors Invalid in README

**Issue**: Push rejected: "colorFrom must be one of..."  
**Solution**: Use only these values: `red`, `yellow`, `green`, `blue`, `indigo`, `purple`, `pink`, `gray`

---

## Adding New Features

### Add a New HTML Page

1. Create `public/new-page.html`
2. Link from `index.html`: `<a href="new-page.html">New Page</a>`
3. Push to GitHub (auto-syncs)

### Add a New API Endpoint

1. Create `public/custom-api.php`:
   ```php
   <?php
   header('Content-Type: application/json');
   echo json_encode(['data' => 'your response']);
   ?>
   ```
2. Call from `script.js`:
   ```js
   fetch('custom-api.php')
     .then(r => r.json())
     .then(data => console.log(data));
   ```
3. Commit and push

### Modify Styling

1. Edit `public/styles.css`
2. Refresh browser (no rebuild needed)

### Update Dockerfile

1. Edit `Dockerfile` (e.g., install packages, add extensions)
2. Test locally: `docker build -t my-webapp .`
3. Commit and push (auto-rebuilds on HF)

---

## Performance Tips

- **Minify CSS/JS** for production (currently human-readable)
- **Cache Control**: Add headers for static assets in Apache config
- **Compress**: Enable gzip in Apache for faster loads
- **CDN**: Use a CDN for large assets (images, fonts)

---

## Security Notes

- ✅ Form inputs sanitized with `htmlspecialchars()`
- ✅ CORS headers set (`Access-Control-Allow-Origin: *`)
- ✅ No database (no SQL injection risk)
- ⚠️ Not suitable for production with sensitive data without additional hardening
- ⚠️ Add authentication/authorization if needed

---

## License

MIT

---

## Support

For issues or questions:
- Check https://github.com/NLarchive/my-webapp-hf/issues
- Review GitHub Actions logs
- Inspect HF Space build logs

---

**Last Updated**: November 17, 2025  
**Maintained by**: NLarchive
