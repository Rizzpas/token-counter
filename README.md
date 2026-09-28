# QuotaTrack — AI Account Quota Tracker

A modern, desktop-first web application to track multiple AI/IDE accounts and their quota/reset cycles (Gemini, Claude, GPT, Codex, and custom providers).

![QuotaTrack Dashboard Preview](https://raw.githubusercontent.com/user-attachments/assets/preview.png)

## ✨ Features

- **Multi-Account & Multi-Provider Support**: Track multiple email accounts, each with independent providers (Gemini, Claude, custom).
- **Absolute Timestamp Engine**: Timers are grounded in real ISO reset timestamps (`resetAt - Date.now()`). No time loss across refreshes, system sleep, or inactive tabs.
- **Dynamic Visual Timers**: Live countdowns updating every second with progress bars and color-coded statuses (`READY 100%`, `ACTIVE`, `EXPIRING SOON <24h`, `ALMOST READY <1h`).
- **Flexible Presets**: Quick 1-day, 2-day, 3-day, 7-day, or custom duration presets.
- **Local Persistence**: Zero backend, zero database, zero external APIs. All data persists safely in LocalStorage.
- **Browser Notifications**: Optional opt-in alerts when quotas reset to READY, or 24h/6h/1h before reset.
- **Instant Search, Filter & Sort**: Search by email, filter by status, and sort by soonest/latest reset or account name.
- **Theme Support**: Polished Dark mode (default), Light mode, and System theme.
- **Data Export & Import**: Backup your accounts and timers to a single JSON file or restore from a previous backup.

## 🚀 Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **LocalStorage API**

## 💻 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/quota-track.git
   cd quota-track
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🌐 Deployment Options

### 1. GitHub Pages (Automated with GitHub Actions)
A workflow is already included in `.github/workflows/deploy.yml`.
1. Push this repository to GitHub.
2. In GitHub, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
4. Every push to `main` will automatically build and deploy!

### 2. Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Import this GitHub repository.
3. Keep default settings (`Framework Preset: Vite`) and click **Deploy**.

### 3. Netlify
1. Go to [netlify.com](https://netlify.com) and click **Add new site** > **Import an existing project**.
2. Connect your GitHub repository.
3. Build command: `npm run build`, Publish directory: `dist`.
4. Click **Deploy**.

## 📄 License

MIT
