# LEONIDA FM — GTA VI Radio Match

Minimalist, bilingual (PT-BR & EN) open-source web app that matches your music taste with every **Grand Theft Auto VI** radio station, host, and in-game podcast — featuring light/dark Miami Vice themes, an in-game HUD station explorer, high-res shareable PNG cards, and stateless friend comparison links.

## Privacy & Open Source Guarantee
- **100% Client-Side:** All taste matching, Spotify `.json` parsing, friend URL comparison (`?compare=`), and PNG card generation happen **exclusively inside your browser**.
- **Zero Database / Zero Tracking:** No user listening history or personal data is ever stored or uploaded to any backend server.
- **MIT Licensed:** Anyone can inspect, audit, fork, or self-host this repository ([LICENSE](./LICENSE)).

## Features
- **Last.fm Multi-Period Analysis:** Fetches `1month`, `6month`, and `overall` top artists & tracks via Last.fm's public read-only API, showing how your Leonida dial evolved over time.
- **Quick Match (No Account Required):** Search 200+ global & Brazilian artists or pick genres to match in 20 seconds.
- **Local Spotify `.json` Import:** Drag-and-drop `StreamingHistory*.json` / `Streaming_History_Audio_*.json` files locally with a built-in step-by-step guide.
- **Interactive Per-Station Breakdown:** Click any station in your ranking to see the exact tracks, matched artists, and vibe-connected artists linking you to that frequency.
- **In-Game GTA VI Radio HUD Carousel:** Browse all **21 music stations** + **2 talk radios** + **4 in-game podcasts** with custom artwork and spoiler-safe collapsible tracklists.
- **In-Game HUD PNG Cards & Light Mode:** Export **9:16 Stories**, **4:5 Feed**, and **Roadtrip Blend** cards in **Vice Synth (Dark)** or **Miami Pastel (Light)** matching the app's full Light/Dark theme toggle.

## Local Development

```bash
# Install dependencies (on Windows PowerShell, use npm.cmd)
npm.cmd install

# Run unit tests
npm.cmd test

# Start local dev server
npm.cmd run dev

# Type-check & build for production
npm.cmd run build
```

## Configuration (`.env`)
Copy `.env.example` to `.env` locally (never commit `.env` to a public repo — add these in your host's Environment Variables instead):

```env
VITE_LASTFM_API_KEY=your_free_lastfm_api_key
VITE_LIVEPIX_URL=https://livepix.gg/yourhandle
VITE_KOFI_URL=https://ko-fi.com/yourhandle
VITE_PIX_KEY=
VITE_GITHUB_URL=https://github.com/youruser/leonida-fm
VITE_ADS_ENABLED=true
```

## Publishing Free Online (GitHub + Vercel / Cloudflare Pages)
1. Push this folder to a **public GitHub repository** (`.gitignore` already excludes `.env`, `node_modules`, and `dist`).
2. Import the repo into **Vercel** or **Cloudflare Pages** (Build command: `npm run build`, Output directory: `dist`).
3. Add `VITE_LASTFM_API_KEY` (and optional `VITE_GITHUB_URL`, `VITE_LIVEPIX_URL`) in the platform's **Environment Variables** and deploy.
