# Iram Anwar — Portfolio

A static portfolio website with a Victorian / antique-print aesthetic.

- **Home** (`index.html`) — a sepia-toned hero of the Boston skyline with an
  animated flying flock, plus résumé highlights, an experience timeline, and
  featured work.
- **Portfolio** (`portfolio.html`) — seven projects with image galleries, plus
  two **interactive 3-D models** (Three.js) you can orbit and zoom.
- **Résumé** (`resume.html`) — a full HTML résumé with a PDF download.

Everything is plain HTML / CSS / vanilla JS — no build step. Three.js is loaded
from a CDN; the aged-paper texture, fonts, and images are the only other assets.

## Run locally

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>. (A local server is used so the ES-module
3-D viewer and PDF load exactly as they will in production.)

## Deploy to GitHub Pages

1. Create a new repository on GitHub.
   - For a site at **`https://<username>.github.io`**, name the repo
     `<username>.github.io`.
   - For a project site at **`https://<username>.github.io/<repo>/`**, use any
     name (e.g. `portfolio`).
2. From this folder:

   ```bash
   git init
   git add .
   git commit -m "Initial portfolio site"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, choose **`main`** and **`/ (root)`**, then **Save**.
4. Wait ~1 minute; the site appears at the URL above.

The `.nojekyll` file tells GitHub Pages to serve the files as-is.

## Add your real 3-D models

See [`assets/models/README.md`](assets/models/README.md) — export the two
SolidWorks assemblies to STL and drop them in; the viewers pick them up
automatically.

## Structure

```
index.html · portfolio.html · resume.html
css/style.css
js/main.js            — nav, scroll-reveal, image lightbox
js/three-viewer.js    — interactive STL / procedural 3-D viewer
assets/
  img/hero/           — processed Victorian hero + colour original
  img/projects/       — portfolio images
  docs/               — résumé PDF
  models/             — drop input-shaft.stl / beam-balancer.stl here
```
