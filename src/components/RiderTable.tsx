import type { FraudResult, PayoutResult, RiderProfile } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RiderTableProps {
  profiles: Map<string, RiderProfile>;
  fraudResults: FraudResult[];
  payouts: PayoutResult[];
}

export function RiderTable({ profiles, fraudResults, payouts }: RiderTableProps) {
  const [filter, setFilter] = useState<'all' | 'fraud' | 'suspicious' | 'paid'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = Array.from(profiles.values()).map(p => {
    const fraud = fraudResults.find(f => f.riderId === p.riderId);
    const payout = payouts.find(pay => pay.riderId === p.riderId);
    return { profile: p, fraud: fraud!, payout: payout! };
  });

  const filtered = rows.filter(r => {
    if (filter === 'fraud') return r.fraud.label === 'fraud';
    if (filter === 'suspicious') return r.fraud.label === 'suspicious';
    if (filter === 'paid') return r.payout.status === 'paid';
    return true;
  });

  const display = filtered.slice(0, 50);

  const fraudBadge = (label: FraudResult['label']) => {
    const cls = {
      legit: 'bg-success/10 text-success',
      suspicious: 'bg-warning/10 text-warning',
      fraud: 'bg-destructive/10 text-destructive',
    };
    return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', cls[label])}>{label}</span>;
  };

  const payoutBadge = (status: PayoutResult['status']) => {
    const cls = {
      paid: 'bg-success/10 text-success',
      delayed: 'bg-warning/10 text-warning',
      blocked: 'bg-destructive/10 text-destructive',
    };
    return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', cls[status])}>{status}</span>;
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm animate-fade-in-up overflow-hidden">
      <div className="flex items-center gap-2 border-b p-4">
        <h3 className="text-sm font-semibold text-card-foreground flex-1">Rider Details</h3>
        {(['all', 'fraud', 'suspicious', 'paid'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors active:scale-95',
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'
            )}
          >
            {f === 'all' ? `All (${rows.length})` : f}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Rider</th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">Avg Del.</th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">Avg Earn.</th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">Premium</th>
              <th className="px-4 py-2 text-center font-medium text-muted-foreground">Fraud</th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">Score</th>
              <th className="px-4 py-2 text-center font-medium text-muted-foreground">Payout</th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            {display.map(r => (
              <>
                <tr
                  key={r.profile.riderId}
                  onClick={() => setExpanded(expanded === r.profile.riderId ? null : r.profile.riderId)}
                  className="border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-card-foreground">{r.profile.riderId}</span>
                    <span className="ml-1.5 text-muted-foreground">{r.profile.name}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.profile.avgDeliveriesPerDay}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">₹{r.profile.avgEarningsPerDay.toFixed(0)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">₹{r.profile.totalPremiumPaid.toFixed(0)}</td>
                  <td className="px-4 py-2.5 text-center">{fraudBadge(r.fraud.label)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-mono">{r.fraud.score.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-center">{payoutBadge(r.payout.status)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">₹{r.payout.amount.toFixed(0)}</td>
                </tr>
                {expanded === r.profile.riderId && (
                  <tr key={r.profile.riderId + '-detail'} className="bg-muted/20">
                    <td colSpan={8} className="px-6 py-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="font-medium text-muted-foreground">Fraud Explanation</span>
                          <ul className="mt-1 space-y-0.5 text-card-foreground">
                            {r.fraud.explanation.map((e, i) => <li key={i}>• {e}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Payout Reason</span>
                          <p className="mt-1 text-card-foreground">{r.payout.reason}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Score Breakdown</span>
                          <div className="mt-1 space-y-0.5 text-card-foreground font-mono">
                            <p>Location: {r.fraud.locationScore.toFixed(2)}</p>
                            <p>Motion: {r.fraud.motionScore.toFixed(2)}</p>
                            <p>Activity: {r.fraud.activityScore.toFixed(2)}</p>
                            <p>Cluster: {r.fraud.clusterScore.toFixed(2)}</p>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Earnings</span>
                          <div className="mt-1 space-y-0.5 text-card-foreground font-mono">
                            <p>Expected: ₹{r.payout.expectedEarnings.toFixed(0)}</p>
                            <p>Actual: ₹{r.payout.actualEarnings.toFixed(0)}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > 50 && (
        <p className="border-t px-4 py-2 text-xs text-muted-foreground">Showing 50 of {filtered.length} riders</p>
      )}
    </div>
  );
}
