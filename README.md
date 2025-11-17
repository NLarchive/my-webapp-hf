# My Web App on Hugging Face Spaces

A simple web application with HTML, CSS, JavaScript, and PHP running on Hugging Face Spaces via Docker.

## Features

- 📄 Static HTML content
- 🎨 Responsive CSS styling
- ⚡ Interactive JavaScript
- 🐘 PHP backend processing
- 🐳 Dockerized with Apache
- 🔄 Auto-sync from GitHub to Hugging Face

## Technologies

- HTML5
- CSS3
- JavaScript (Vanilla)
- PHP 8.2
- Apache Web Server
- Docker

## Local Development

### Run with Docker

```bash
# Build the image
docker build -t my-webapp .

# Run the container
docker run -p 7860:7860 my-webapp
```

Visit http://localhost:7860

### File Structure

```
.
├── Dockerfile
├── README.md
├── .gitignore
├── .dockerignore
└── public/
    ├── index.html
    ├── styles.css
    ├── script.js
    ├── api.php
    └── process.php
```

## Deployment

This app is automatically deployed to Hugging Face Spaces from GitHub.

Live URL: [Your Space URL will be here]

## License

MIT
