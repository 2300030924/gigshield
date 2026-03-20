import { useSimulation } from '@/hooks/useSimulation';
import { ScenarioSelector } from '@/components/ScenarioSelector';
import { StatCard } from '@/components/StatCard';
import { WeatherPanel } from '@/components/WeatherPanel';
import { DeliveriesChart, FraudPieChart, FraudScatterChart, PayoutBarChart } from '@/components/Charts';
import { RiderTable } from '@/components/RiderTable';

export default function Dashboard() {
  const { scenario, setScenario, sim, profiles, fraudResults, payouts, premiums, triggers, summary } = useSimulation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              G
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight">GigShield</h1>
              <p className="text-[10px] text-muted-foreground">AI Parametric Insurance for Gig Workers</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Scenario Selection */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo Scenario</h2>
          <ScenarioSelector scenario={scenario} onSelect={setScenario} />
        </section>

        {/* Weather & Conditions */}
        <WeatherPanel
          weather={sim.weather}
          traffic={sim.traffic}
          disasterEvent={sim.disasterEvent}
          date={sim.date}
        />

        {/* Summary Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard label="Riders" value={summary.riderCount} icon="🏍️" delay={0} />
          <StatCard label="Premium Collected" value={`₹${summary.totalPremium.toLocaleString()}`} icon="💰" delay={60} />
          <StatCard label="Triggers" value={summary.triggeredCount} variant={summary.triggeredCount > 0 ? 'warning' : 'default'} icon="⚡" delay={120} />
          <StatCard label="Payouts" value={`₹${summary.totalPayouts.toLocaleString()}`} variant="success" icon="✅" delay={180} />
          <StatCard label="Paid" value={summary.paidCount} variant="success" icon="📤" delay={240} />
          <StatCard label="Suspicious" value={summary.suspiciousCount} variant="warning" icon="🔍" delay={300} />
          <StatCard label="Fraud" value={summary.fraudCount} variant={summary.fraudCount > 0 ? 'destructive' : 'default'} icon="🛑" delay={360} />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DeliveriesChart profiles={profiles} riderDays={sim.riderDays} />
          <FraudPieChart fraudResults={fraudResults} />
          <FraudScatterChart fraudResults={fraudResults} />
          <PayoutBarChart payouts={payouts} />
        </section>

        {/* Rider Table */}
        <RiderTable profiles={profiles} fraudResults={fraudResults} payouts={payouts} />

        {/* Footer */}
        <footer className="border-t pt-4 pb-8 text-center text-xs text-muted-foreground">
          GigShield MVP — AI Parametric Insurance Platform • 200 simulated riders • Synthetic data
        </footer>
      </main>
    </div>
  );
}
