import { PieChart } from 'lucide-react';
import { Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboardStore } from '../../store/dashboardStore';

const COLORS = ['#22d3ee', '#a78bfa', '#f59e0b', '#34d399', '#f472b6', '#60a5fa'];

export function NewsDistributionChart() {
  const { articles, activeCategory } = useDashboardStore((state) => state.news);
  const setNewsCategory = useDashboardStore((state) => state.setNewsCategory);
  const counts = articles.reduce<Record<string, number>>((acc, article) => {
    acc[article.category] = (acc[article.category] ?? 0) + 1;
    return acc;
  }, {});
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="section-kicker">News mix</p>
          <h2 className="section-title text-xl">Distribution</h2>
        </div>
        <PieChart className="text-amber-400" />
      </div>
      <div className="h-56">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={54}
                outerRadius={86}
                paddingAngle={4}
                onClick={(entry) => setNewsCategory(activeCategory === entry.name ? 'All' : entry.name)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    cursor="pointer"
                    fill={COLORS[index % COLORS.length]}
                    opacity={activeCategory === 'All' || activeCategory === entry.name ? 1 : 0.35}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)' }} />
            </RePieChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center text-center text-sm text-muted">
            News categories appear after the feed loads.
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className={`chip ${activeCategory === 'All' ? 'chip-active' : ''}`} onClick={() => setNewsCategory('All')}>
          All
        </button>
        {data.map((item) => (
          <button
            key={item.name}
            className={`chip ${activeCategory === item.name ? 'chip-active' : ''}`}
            onClick={() => setNewsCategory(item.name)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </section>
  );
}
