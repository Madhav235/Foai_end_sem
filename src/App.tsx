import { motion } from 'framer-motion';
import { Activity, Newspaper, Satellite, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { DashboardShell } from './components/layout/DashboardShell';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { Chatbot } from './features/chatbot/Chatbot';
import { NewsPanel } from './features/news/NewsPanel';
import { IssPanel } from './features/iss/IssPanel';
import { SpeedChart } from './features/charts/SpeedChart';
import { NewsDistributionChart } from './features/charts/NewsDistributionChart';
import { useDashboardStore } from './store/dashboardStore';

export default function App() {
  const { hydrateTheme, iss, news } = useDashboardStore();

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  const stats = [
    {
      label: 'Live latitude',
      value: iss.current ? iss.current.latitude.toFixed(3) : '--',
      icon: Satellite,
      accent: 'text-cyan-400',
    },
    {
      label: 'ISS speed',
      value: typeof iss.currentSpeed === 'number' ? `${Math.round(iss.currentSpeed).toLocaleString()} km/h` : '--',
      icon: Activity,
      accent: 'text-emerald-400',
    },
    {
      label: 'Space crew',
      value: String(iss.astronauts.length || 0),
      icon: Sparkles,
      accent: 'text-violet-400',
    },
    {
      label: 'Articles cached',
      value: String(news.articles.length || 0),
      icon: Newspaper,
      accent: 'text-amber-400',
    },
  ];

  return (
    <ErrorBoundary>
      <DashboardShell>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.article
              key={stat.label}
              className="panel flex min-h-28 items-center justify-between p-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <div>
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.accent}`} />
            </motion.article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
          <IssPanel />
          <div className="grid gap-6">
            <SpeedChart />
            <NewsDistributionChart />
          </div>
        </section>

        <NewsPanel />
      </DashboardShell>
      <Chatbot />
    </ErrorBoundary>
  );
}
