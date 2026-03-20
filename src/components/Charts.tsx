import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis,
  LineChart, Line, Legend,
} from 'recharts';
import type { FraudResult, TriggerResult, PayoutResult, RiderProfile, RiderDay } from '@/lib/types';

const COLORS = {
  primary: 'hsl(220 72% 50%)',
  accent: 'hsl(162 63% 41%)',
  warning: 'hsl(38 92% 50%)',
  destructive: 'hsl(0 72% 51%)',
  muted: 'hsl(220 10% 70%)',
};

export function DeliveriesChart({ profiles, riderDays }: { profiles: Map<string, RiderProfile>; riderDays: RiderDay[] }) {
  const data = riderDays.slice(0, 30).map(rd => {
    const profile = profiles.get(rd.riderId);
    return {
      rider: rd.riderId,
      expected: profile?.avgDeliveriesPerDay ?? 0,
      actual: rd.actualDeliveries,
    };
  });

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm animate-fade-in-up">
      <h3 className="mb-4 text-sm font-semibold text-card-foreground">Expected vs Actual Deliveries (first 30 riders)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
          <XAxis dataKey="rider" tick={{ fontSize: 9 }} interval={2} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(220 13% 90%)' }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="expected" fill={COLORS.muted} name="Expected" radius={[3, 3, 0, 0]} />
          <Bar dataKey="actual" fill={COLORS.primary} name="Actual" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FraudPieChart({ fraudResults }: { fraudResults: FraudResult[] }) {
  const counts = { legit: 0, suspicious: 0, fraud: 0 };
  fraudResults.forEach(f => counts[f.label]++);
  const data = [
    { name: 'Legit', value: counts.legit, color: COLORS.accent },
    { name: 'Suspicious', value: counts.suspicious, color: COLORS.warning },
    { name: 'Fraud', value: counts.fraud, color: COLORS.destructive },
  ].filter(d => d.value > 0);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm animate-fade-in-up">
      <h3 className="mb-4 text-sm font-semibold text-card-foreground">Fraud Score Distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FraudScatterChart({ fraudResults }: { fraudResults: FraudResult[] }) {
  const data = fraudResults.map(f => ({
    location: f.locationScore,
    motion: f.motionScore,
    score: f.score,
    label: f.label,
    id: f.riderId,
  }));

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm animate-fade-in-up">
      <h3 className="mb-4 text-sm font-semibold text-card-foreground">Fraud: Location vs Motion Scores</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
          <XAxis dataKey="location" name="Location" tick={{ fontSize: 10 }} label={{ value: 'Location Score', position: 'bottom', fontSize: 11 }} />
          <YAxis dataKey="motion" name="Motion" tick={{ fontSize: 10 }} label={{ value: 'Motion Score', angle: -90, position: 'insideLeft', fontSize: 11 }} />
          <ZAxis dataKey="score" range={[30, 200]} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(val: number) => val.toFixed(2)} />
          <Scatter data={data.filter(d => d.label === 'legit')} fill={COLORS.accent} name="Legit" />
          <Scatter data={data.filter(d => d.label === 'suspicious')} fill={COLORS.warning} name="Suspicious" />
          <Scatter data={data.filter(d => d.label === 'fraud')} fill={COLORS.destructive} name="Fraud" />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PayoutBarChart({ payouts }: { payouts: PayoutResult[] }) {
  const paid = payouts.filter(p => p.status === 'paid');
  const delayed = payouts.filter(p => p.status === 'delayed');
  const blocked = payouts.filter(p => p.status === 'blocked' && p.amount > 0);

  const data = [
    { status: 'Paid', count: paid.length, total: Math.round(paid.reduce((s, p) => s + p.amount, 0)), color: COLORS.accent },
    { status: 'Delayed', count: delayed.length, total: Math.round(delayed.reduce((s, p) => s + p.amount, 0)), color: COLORS.warning },
    { status: 'Blocked', count: blocked.length, total: Math.round(blocked.reduce((s, p) => s + p.amount, 0)), color: COLORS.destructive },
  ];

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm animate-fade-in-up">
      <h3 className="mb-4 text-sm font-semibold text-card-foreground">Payout Decisions</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
          <XAxis dataKey="status" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(val: number) => `₹${val.toLocaleString()}`} />
          <Bar dataKey="total" name="Total Amount (₹)" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
