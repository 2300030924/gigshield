import { useMemo, useState } from 'react';
import type { ScenarioType } from '@/lib/types';
import { generateRiders, simulateDay } from '@/lib/simulation';
import { buildAllProfiles } from '@/lib/profileEngine';
import { calculatePremium } from '@/lib/premiumEngine';
import { checkTrigger } from '@/lib/triggerEngine';
import { detectAllFraud } from '@/lib/fraudDetection';
import { calculatePayout } from '@/lib/payoutEngine';
import { peerValidation } from '@/lib/peerBenchmark';

export function useSimulation() {
  const [scenario, setScenario] = useState<ScenarioType>('normal');
  const [riderCount] = useState(200);

  const data = useMemo(() => {
    const riders = generateRiders(riderCount);
    const profiles = buildAllProfiles(riders);
    const sim = simulateDay(riders, scenario);
    
    const premiums = sim.riderDays.map(rd => {
      const rider = riders.find(r => r.id === rd.riderId)!;
      return calculatePremium(rider, rd, sim.traffic, sim.weather);
    });

    const fraudResults = detectAllFraud(sim);
    const fraudMap = new Map(fraudResults.map(f => [f.riderId, f]));

    const triggers = sim.riderDays.map(rd => {
      const profile = profiles.get(rd.riderId)!;
      return checkTrigger(profile, rd, sim.weather);
    });

    const payouts = sim.riderDays.map(rd => {
      const profile = profiles.get(rd.riderId)!;
      const trigger = triggers.find(t => t.riderId === rd.riderId)!;
      const fraud = fraudMap.get(rd.riderId)!;
      return calculatePayout(profile, rd, trigger, fraud);
    });

    const peerResults = sim.riderDays.map(rd => {
      const rider = riders.find(r => r.id === rd.riderId)!;
      return peerValidation(rider, rd, riders, sim.riderDays);
    });

    // Update profiles with premiums
    premiums.forEach(p => {
      const profile = profiles.get(p.riderId);
      if (profile) profile.totalPremiumPaid = p.premium;
    });

    // Summary stats
    const totalPremium = premiums.reduce((s, p) => s + p.premium, 0);
    const totalPayouts = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const triggeredCount = triggers.filter(t => t.triggered).length;
    const fraudCount = fraudResults.filter(f => f.label === 'fraud').length;
    const suspiciousCount = fraudResults.filter(f => f.label === 'suspicious').length;
    const paidCount = payouts.filter(p => p.status === 'paid').length;
    const blockedCount = payouts.filter(p => p.status === 'blocked' && p.amount > 0).length;

    return {
      riders,
      profiles,
      sim,
      premiums,
      fraudResults,
      triggers,
      payouts,
      peerResults,
      summary: {
        totalPremium: Math.round(totalPremium),
        totalPayouts: Math.round(totalPayouts),
        triggeredCount,
        fraudCount,
        suspiciousCount,
        paidCount,
        blockedCount,
        riderCount: riders.length,
      },
    };
  }, [scenario, riderCount]);

  return { scenario, setScenario, ...data };
}
