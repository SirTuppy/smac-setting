# National Deployment Guide

This application is designed to be highly portable and secure. Since it processes all data locally in the browser, you can host it on any static web server (like GitHub Pages) without worrying about data privacy.

## 🚀 GitHub Pages Deployment

To host this on your personal or company GitHub Pages:

1.  **Configure Base Path**:
    Open `vite.config.ts` and add the `base` property with your repository name:
    ```typescript
    export default defineConfig({
      plugins: [react()],
      base: '/smac-setting-dashboard/', // Change to your repo name
    })
    ```

2.  **Build the Project**:
    Run the following command in your terminal:
    ```powershell
    npm run build
    ```

3.  **Deploy**:
    Copy the contents of the `dist/` folder to your GitHub repository's `gh-pages` branch or the root of your Pages site.

## 🔒 Security & Privacy FAQ

**"Is the data public?"**
The *code* is public, but the **data** is not. When a routesetter uploads a CSV, it is read into the browser's memory and stay there. It is never uploaded to GitHub, Google, or any external server. 

**"What about my saved maps?"**
Saved maps in the Generator are stored in the user's local browser storage (`localStorage`). They do not persist across different computers unless you use the "Save Latest" feature to download a backup.

## 🛠️ Nationwide Updates
When you want to roll out a new feature to all gyms:
1. Update the code in your main repo.
2. Run `npm run build`.
3. Push the new `dist/` folder.
4. All directors will see the update the next time they refresh their page!
