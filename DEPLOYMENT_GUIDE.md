# How to Publish "Ship Battle" to GitHub Pages

Since I have optimized the game to run as a **Single File**, publishing it is incredibly easy. You have two options:

## Option 1: The Easiest Way (Just the Game)
Use this if you just want to share the game and don't care about hosting the source code for other developers to see.

1.  **Locate the File**: Go to the `dist` folder inside your project. You will see an `index.html` file (filesize approx 1MB). **This file is the entire game.**
2.  **Create a Repository**: Go to GitHub.com and create a new repository (e.g., `ship-battle`).
3.  **Upload**: Click "Add file" -> "Upload files", and drag ONLY that `dist/index.html` file into the upload box. Commit changes.
4.  **Activate Pages**:
    *   Go to **Settings** -> **Pages**.
    *   Under **Source**, select `Deploy from a branch`.
    *   Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
    *   Click **Save**.
5.  **Play**: Wait about 60 seconds. Your game will be live at `https://<your-username>.github.io/ship-battle/`.

## Option 2: The "Developer" Way (Source Code)
Use this if you want to back up your code and allow others to see how it was built.

1.  **Create Repository**: Create a new empty repository on GitHub.
2.  **Push Code**: Run these commands in your project terminal:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/<your-username>/<repo-name>.git
    git push -u origin main
    ```
    *(Note: Replace the URL with your actual repository URL)*
3.  **Configure Pages**:
    *   Go to **Settings** -> **Pages**.
    *   Select `Deploy from a branch`.
    *   Select `main` branch and `/ (root)` folder.
    *   **Important**: Because we have the `dist` folder ignored by default (standard practice), you need to change your build process or, simpler for now, remove `dist` from `.gitignore` before the steps above if you want to deploy the `dist` folder directly from the root. 
    *   **Better Alternative for Option 2**: Since this is a React app, usually you set up a GitHub Action to build it.
    
    **Recommendation for you**: Stick to **Option 1** for now as it is foolproof with the Single-File build I created for you.
