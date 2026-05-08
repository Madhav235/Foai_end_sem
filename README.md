# OrbitDesk

Production-ready React + Vite dashboard for live ISS tracking, aerospace news, charts, and a dashboard-scoped AI assistant.

## Local Setup

```bash
npm install
npm run dev
```

Create a local `.env` file using `.env.example`:

```bash
NEWSDATA_API_KEY=your_newsdata_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_token_here
```

The app intentionally uses server-side `/api/news` and `/api/chat` routes so API tokens are not bundled into the browser.

## Checks

```bash
npm run lint
npm run build
```

## Vercel

Add `NEWSDATA_API_KEY` and `HUGGINGFACE_API_KEY` in Vercel project environment variables before deployment.
# Foai_end_sem
