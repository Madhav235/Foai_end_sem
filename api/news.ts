import { cleanText, fetchWithTimeout, json, rateLimit, safeHttpsUrl } from './_security';

const NEWS_ENDPOINT = 'https://newsdata.io/api/1/news';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80';

function normalizeArticle(article: Record<string, unknown>, index: number) {
  const title = cleanText(article.title, 'Untitled aerospace update', 180);
  const source = cleanText(article.source_name, 'NewsData', 80);
  const parsedDate = new Date(String(article.pubDate ?? ''));
  const publishedAt = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
  const category = Array.isArray(article.category)
    ? cleanText(article.category[0], 'Space', 40)
    : cleanText(article.category, 'Space', 40);

  return {
    id: cleanText(article.article_id, `${title}-${index}`, 140),
    title,
    source,
    author: Array.isArray(article.creator) ? cleanText(article.creator[0], '', 80) : cleanText(article.creator, '', 80),
    imageUrl: safeHttpsUrl(article.image_url, FALLBACK_IMAGE),
    publishedAt,
    description: cleanText(article.description ?? article.content, 'No short description was provided.', 420),
    url: safeHttpsUrl(article.link, '#'),
    category,
  };
}

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  if (rateLimit(request, 40, 60_000)) return json({ error: 'Too many requests' }, 429);

  const key = process.env.NEWSDATA_API_KEY;
  if (!key) {
    return json({ error: 'News service is not configured' }, 503);
  }

  const url = new URL(NEWS_ENDPOINT);
  url.searchParams.set('apikey', key);
  url.searchParams.set('q', 'space OR NASA OR ISS OR astronaut');
  url.searchParams.set('language', 'en');
  url.searchParams.set('size', '10');

  try {
    const response = await fetchWithTimeout(url);
    const data = (await response.json()) as {
      status?: string;
      message?: string;
      results?: Record<string, unknown>[];
    };

    if (!response.ok || data.status === 'error' || !Array.isArray(data.results)) {
      return json({ error: cleanText(data.message, 'Unable to fetch news', 140) }, response.status || 502);
    }

    return json({ articles: data.results.slice(0, 20).map(normalizeArticle) });
  } catch {
    return json({ error: 'News service timed out' }, 504);
  }
}
