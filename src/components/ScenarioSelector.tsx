import type { ScenarioType } from '@/lib/types';
import { cn } from '@/lib/utils';

const SCENARIOS: { key: ScenarioType; label: string; desc: string; icon: string }[] = [
  { key: 'normal', label: 'Normal Day', desc: 'Clear weather, regular traffic', icon: '☀️' },
  { key: 'heavy_rain', label: 'Heavy Rain', desc: 'Severe rainfall, all riders affected', icon: '🌧️' },
  { key: 'individual_lazy', label: 'Individual Laziness', desc: 'One rider underperforms', icon: '😴' },
  { key: 'fraud_attack', label: 'Fraud Attack', desc: 'GPS spoofing & cluster fraud', icon: '🚨' },
];

interface Props {
  scenario: ScenarioType;
  onSelect: (s: ScenarioType) => void;
}

export function ScenarioSelector({ scenario, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {SCENARIOS.map((s, i) => (
        <button
          key={s.key}
          onClick={() => onSelect(s.key)}
          className={cn(
            'relative rounded-lg border-2 p-4 text-left transition-all duration-200 active:scale-[0.97]',
            'hover:shadow-md',
            scenario === s.key
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border bg-card hover:border-muted-foreground/30'
          )}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <span className="text-2xl">{s.icon}</span>
          <h3 className="mt-2 font-semibold text-sm text-card-foreground">{s.label}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
          {scenario === s.key && (
            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
