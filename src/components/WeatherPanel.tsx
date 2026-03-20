import type { WeatherData, TrafficData } from '@/lib/types';

interface Props {
  weather: WeatherData;
  traffic: TrafficData;
  disasterEvent: boolean;
  date: string;
}

export function WeatherPanel({ weather, traffic, disasterEvent, date }: Props) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-card-foreground">Conditions — {date}</h3>
        {disasterEvent && (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            ⚠ Disaster Event
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="rounded-md bg-muted/50 p-3">
          <span className="text-muted-foreground">Rainfall</span>
          <p className="mt-1 text-lg font-bold tabular-nums text-card-foreground">{weather.rainfall.toFixed(1)}mm</p>
        </div>
        <div className="rounded-md bg-muted/50 p-3">
          <span className="text-muted-foreground">Temperature</span>
          <p className="mt-1 text-lg font-bold tabular-nums text-card-foreground">{weather.temperature.toFixed(1)}°C</p>
        </div>
        <div className="rounded-md bg-muted/50 p-3">
          <span className="text-muted-foreground">AQI</span>
          <p className="mt-1 text-lg font-bold tabular-nums text-card-foreground">{weather.aqi.toFixed(0)}</p>
        </div>
        <div className="rounded-md bg-muted/50 p-3">
          <span className="text-muted-foreground">Congestion</span>
          <p className="mt-1 text-lg font-bold tabular-nums text-card-foreground">{(traffic.congestionLevel * 100).toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
}
