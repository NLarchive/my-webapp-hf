# Setup Instructions

## Complete Step-by-Step Guide

### Part 1: Create GitHub Repository

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `my-webapp-hf` (or your choice)
   - Make it **Public** (easier for HF Spaces)
   - ✅ Initialize with README (optional, we have our own)
   - Click **Create repository**

2. **Clone the repository to your local machine:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/my-webapp-hf.git
   cd my-webapp-hf
   ```

3. **Copy all the files from this project** into your local repository folder

4. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit: Web app with HTML, CSS, JS, PHP and Docker"
   git push origin main
   ```

---

### Part 2: Create Hugging Face Space

1. **Go to Hugging Face Spaces:**
   - Visit https://huggingface.co/spaces
   - Click **Create new Space**

2. **Configure the Space:**
   - **Owner:** Your HF username
   - **Space name:** `my-webapp-hf` (or match your GitHub repo name)
   - **License:** Choose one (e.g., MIT)
   - **Select SDK:** Choose **Docker**
   - **Space hardware:** CPU basic (free tier)
   - **Visibility:** Public
   - Click **Create Space**

3. **Import from GitHub (Option A - Easier):**
   - On the Space page, look for **Settings**
   - Click **Settings** → **Sync with GitHub**
   - Authorize Hugging Face to access your GitHub
   - Select your repository
   - Click **Import**
   - HF will clone your repo and build automatically

---

### Part 3: Set Up Auto-Sync (GitHub → Hugging Face)

1. **Get your Hugging Face Token:**
   - Go to https://huggingface.co/settings/tokens
   - Click **New token**
   - Name: `GitHub Sync Token`
   - Role: **Write**
   - Click **Generate**
   - **Copy the token** (save it securely)

2. **Add the token to GitHub Secrets:**
   - Go to your GitHub repo settings
   - **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `HF_TOKEN`
   - Value: paste your HF token
   - Click **Add secret**

3. **Update the GitHub Action workflow:**
   - Edit `.github/workflows/sync-to-hf.yml`
   - Replace `NLarchive` with your GitHub username
   - Replace `YOUR_SPACE_NAME` with your actual space name
   - Commit and push

4. **Verify the Action:**
   - Go to your GitHub repo → **Actions** tab
   - You should see "Sync to Hugging Face Space" workflow
   - On future pushes to `main`, changes will auto-deploy to HF

---

### Part 4: Test Locally

```bash
# Build the Docker image
docker build -t my-webapp .

# Run the container
docker run -p 7860:7860 my-webapp

# Visit http://localhost:7860 in your browser
```

---

### Part 5: Verify on Hugging Face

1. Go to your Space: `https://huggingface.co/spaces/YOUR_USERNAME/my-webapp-hf`
2. Check **Logs** or **Build logs** for any errors
3. Wait for Docker build to complete (2-5 minutes on first build)
4. Once running, click on your Space URL
5. Test all features:
   - Click the "Click Me" button (tests JavaScript)
   - Check PHP content loads
   - Submit the form

---

## Project Structure

```
my-webapp-hf/
├── Dockerfile              # Docker configuration for Apache + PHP 8.2
├── README.md               # Project documentation
├── .gitignore              # Git ignore rules
├── .dockerignore           # Docker ignore rules
├── .github/
│   └── workflows/
│       └── sync-to-hf.yml  # GitHub Action for auto-sync
└── public/                 # Web root (served by Apache)
    ├── index.html          # Main HTML page
    ├── styles.css          # Styling
    ├── script.js           # JavaScript functionality
    ├── api.php             # API endpoint for dynamic content
    └── process.php         # Form processing endpoint
```

---

## Key Features

✅ **Modular Architecture:** Each file has a single responsibility  
✅ **Maintainable Code:** Clean, well-organized structure  
✅ **Plug-and-play:** Easy to add new features or APIs  
✅ **Production Ready:** Proper headers, error handling, security basics  
✅ **Responsive Design:** Works on mobile and desktop  
✅ **Full Stack:** HTML + CSS + JavaScript + PHP  
✅ **Docker Support:** Single command deployment  
✅ **Auto-Sync:** Changes to GitHub automatically deploy to HF Spaces  

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Docker still building, wait 2-5 minutes |
| Build failed | Check Docker build logs for errors |
| PHP not working | Verify files are in `public/` folder |
| Page not loading | Ensure port 7860 is used in Dockerfile |
| Auto-sync not working | Check GitHub Actions logs, verify HF_TOKEN secret |

---

## Quick Commands

```bash
# Local Docker testing
docker build -t my-webapp .
docker run -p 7860:7860 my-webapp

# Push to GitHub
git add .
git commit -m "Your message"
git push origin main

# Manual push to HF Spaces
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/my-webapp-hf
git push hf main
```

---

For detailed instructions, see README.md
