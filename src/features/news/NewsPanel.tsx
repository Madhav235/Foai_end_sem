import { ExternalLink, RefreshCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Skeleton } from '../../components/shared/Skeleton';
import { useNews } from '../../hooks/useNews';
import { useDashboardStore } from '../../store/dashboardStore';
import { safeHttpsUrl } from '../../utils/validation';

type SortKey = 'date' | 'source';

export function NewsPanel() {
  useNews();
  const { news, refreshNews } = useDashboardStore();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('date');

  const visibleArticles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return news.articles
      .filter((article) => news.activeCategory === 'All' || article.category === news.activeCategory)
      .filter((article) =>
        [article.title, article.source, article.author, article.description].join(' ').toLowerCase().includes(normalized),
      )
      .sort((a, b) =>
        sort === 'date'
          ? new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          : a.source.localeCompare(b.source),
      );
  }, [news.activeCategory, news.articles, query, sort]);

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-soft p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="section-kicker">Latest aerospace feed</p>
          <h2 className="section-title">News Dashboard</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="search-field">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search news" />
          </label>
          <select className="select-field" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="date">Sort by date</option>
            <option value="source">Sort by source</option>
          </select>
          <button className="secondary-button" onClick={() => void refreshNews({ force: true })} disabled={news.loading}>
            <RefreshCcw size={16} className={news.loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-5">
        {news.loading && !news.articles.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-72" />
            ))}
          </div>
        ) : news.error && !news.articles.length ? (
          <div className="empty-state">
            <p>{news.error}</p>
            <button className="primary-button" onClick={() => void refreshNews({ force: true })}>
              Retry news
            </button>
          </div>
        ) : visibleArticles.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleArticles.map((article) => (
              <article key={article.id} className="news-card">
                <img src={article.imageUrl} alt="" loading="lazy" />
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between gap-3 text-xs text-muted">
                    <span>{article.source}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-lg font-semibold">{article.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{article.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="chip">{article.author || 'Editorial desk'}</span>
                    {safeHttpsUrl(article.url, '#') === '#' ? (
                      <span className="chip">Link unavailable</span>
                    ) : (
                      <a className="link-button" href={article.url} target="_blank" rel="noopener noreferrer">
                        Read More <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No articles match the current search and category filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}
