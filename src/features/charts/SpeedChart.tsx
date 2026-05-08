import { Activity } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDashboardStore } from '../../store/dashboardStore';

export function SpeedChart() {
  const speeds = useDashboardStore((state) => state.iss.speeds);
  const data = speeds.map((point) => ({
    time: new Date(point.timestamp * 1000).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
    speed: Math.round(point.speed),
  }));

  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="section-kicker">Telemetry</p>
          <h2 className="section-title text-xl">ISS Speed</h2>
        </div>
        <Activity className="text-emerald-400" />
      </div>
      <div className="h-64">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis dataKey="time" stroke="var(--muted)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--muted)" tick={{ fontSize: 11 }} domain={['dataMin - 500', 'dataMax + 500']} />
              <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)' }} />
              <Line type="monotone" dataKey="speed" stroke="#34d399" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center text-center text-sm text-muted">
            Speed appears after two position samples.
          </div>
        )}
      </div>
    </section>
  );
}
