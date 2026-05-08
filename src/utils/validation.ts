import type { Astronaut, ChatMessage, IssPosition, NewsArticle } from '../types/dashboard';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80';

function cleanText(value: unknown, fallback = '', maxLength = 500) {
  return String(value ?? fallback)
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      return code < 32 || code === 127 ? ' ' : char;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function safeHttpsUrl(value: unknown, fallback = '#') {
  try {
    const url = new URL(String(value ?? ''));
    return url.protocol === 'https:' ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function sanitizeNewsArticles(value: unknown): NewsArticle[] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 30).map((article, index) => {
    const item = article as Partial<NewsArticle>;
    const date = new Date(String(item.publishedAt ?? ''));

    return {
      id: cleanText(item.id, `article-${index}`, 140),
      title: cleanText(item.title, 'Untitled aerospace update', 180),
      source: cleanText(item.source, 'News source', 80),
      author: cleanText(item.author, '', 80),
      imageUrl: safeHttpsUrl(item.imageUrl, FALLBACK_IMAGE),
      publishedAt: Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
      description: cleanText(item.description, 'No short description was provided.', 420),
      url: safeHttpsUrl(item.url, '#'),
      category: cleanText(item.category, 'Space', 40),
    };
  });
}

export function sanitizeChatMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-30)
    .map((message) => {
      const item = message as Partial<ChatMessage>;
      const role: ChatMessage['role'] = item.role === 'assistant' ? 'assistant' : 'user';
      return {
        id: cleanText(item.id, crypto.randomUUID(), 80),
        role,
        content: cleanText(item.content, '', 1200),
        createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
      };
    })
    .filter((message) => message.content);
}

export function sanitizeIssPosition(value: unknown): IssPosition {
  const item = value as Partial<IssPosition>;
  const latitude = Number(item.latitude);
  const longitude = Number(item.longitude);
  const timestamp = Number(item.timestamp);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(timestamp) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error('Malformed ISS position response');
  }

  return { latitude, longitude, timestamp };
}

export function sanitizeAstronauts(value: unknown): Astronaut[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 20)
    .map((person) => {
      const item = person as Partial<Astronaut>;
      return {
        name: cleanText(item.name, '', 80),
        craft: cleanText(item.craft, 'ISS', 40),
      };
    })
    .filter((person) => person.name);
}
