# How to Publish "Ship Battle" to GitHub Pages

The game is hosted at `https://fab4arsnl2008.github.io/ship-battle/`.

---

## Method 1: The Automated Way with GitHub Actions (Recommended)

A workflow file ([.github/workflows/deploy.yml](file:///.github/workflows/deploy.yml)) is set up to automatically build and publish the game every time you push code to GitHub.

### 1. Enable GitHub Actions for Pages in GitHub Settings
1. Go to your repository on GitHub: **https://github.com/fab4arsnl2008/ship-battle**
2. Click **Settings** (tab at the top).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment > Source**, click the dropdown and select:
   **GitHub Actions** (instead of "Deploy from a branch").

### 2. Commit and Push
Run the following in your terminal:
```bash
git add .
git commit -m "Configure GitHub Actions deployment for GitHub Pages"
git push origin main
```

GitHub Actions will automatically run the build and publish the site. In about 60–90 seconds, your game will be live at:
👉 **https://fab4arsnl2008.github.io/ship-battle/**

---

## Method 2: Manual Single-File Upload

If you prefer deploying without GitHub Actions:
1. Run `npm run build` in your project to produce `dist/index.html`.
2. The `dist/index.html` file (~1 MB) contains the complete game with all graphics, sounds, and code bundled together.
3. In GitHub repository **Settings > Pages**, select **Source: Deploy from a branch**, Branch: `main`, folder: `/ (root)`.
4. Upload or copy `dist/index.html` to the repository root and commit it.
