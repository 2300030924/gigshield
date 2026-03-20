import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  icon?: string;
  delay?: number;
}

export function StatCard({ label, value, sub, variant = 'default', icon, delay = 0 }: StatCardProps) {
  const colors = {
    default: 'border-border',
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    destructive: 'border-destructive/30 bg-destructive/5',
  };

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm animate-fade-in-up',
        colors[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-card-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
