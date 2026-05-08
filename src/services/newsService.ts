import type { NewsArticle } from '../types/dashboard';
import { http } from './http';
import { readStorage, writeStorage } from '../utils/storage';
import { sanitizeNewsArticles } from '../utils/validation';

const CACHE_KEY = 'orbitdesk.news.cache';
const CACHE_TTL = 15 * 60 * 1000;

type CachedNews = {
  savedAt: number;
  articles: NewsArticle[];
};

export async function fetchNews({ force = false, signal }: { force?: boolean; signal?: AbortSignal } = {}) {
  const cached = readStorage<CachedNews | null>(CACHE_KEY, null);
  if (!force && cached && Date.now() - cached.savedAt < CACHE_TTL) {
    return sanitizeNewsArticles(cached.articles);
  }

  const { data } = await http.get<{ articles: NewsArticle[] }>('/api/news', { signal });
  const articles = sanitizeNewsArticles(data.articles);
  writeStorage<CachedNews>(CACHE_KEY, { savedAt: Date.now(), articles });
  return articles;
}
