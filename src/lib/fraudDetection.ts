import type { RiderDay, FraudResult, DaySimulation } from './types';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Layer 1: Location consistency
function locationScore(rd: RiderDay): { score: number; note: string } {
  const dist = haversineKm(rd.gpsLat, rd.gpsLng, rd.cellTowerLat, rd.cellTowerLng);
  if (dist < 2) return { score: 0, note: `GPS-Cell distance ${dist.toFixed(1)}km — consistent` };
  if (dist < 5) return { score: 0.5, note: `GPS-Cell distance ${dist.toFixed(1)}km — suspicious` };
  return { score: 1, note: `GPS-Cell distance ${dist.toFixed(1)}km — spoofed` };
}

// Layer 2: Motion analysis
function motionScore(rd: RiderDay): { score: number; note: string } {
  if (rd.speedVariance < 3) return { score: 0.8, note: `Speed variance ${rd.speedVariance} — unnaturally static` };
  if (rd.movementRandomness < 0.2) return { score: 0.7, note: `Movement randomness ${rd.movementRandomness} — too smooth` };
  return { score: 0, note: 'Normal motion pattern' };
}

// Layer 3: Activity check
function activityScore(rd: RiderDay): { score: number; note: string } {
  if (!rd.appActivity && rd.actualDeliveries === 0) return { score: 1, note: 'No app activity, zero deliveries' };
  if (!rd.appActivity) return { score: 0.5, note: 'No app activity but some deliveries recorded' };
  return { score: 0, note: 'Normal app activity' };
}

// Layer 4: Cluster detection
function clusterScore(rd: RiderDay, allRiderDays: RiderDay[]): { score: number; note: string } {
  const CLUSTER_DIST = 0.5; // km
  const nearby = allRiderDays.filter(other =>
    other.riderId !== rd.riderId &&
    haversineKm(rd.gpsLat, rd.gpsLng, other.gpsLat, other.gpsLng) < CLUSTER_DIST
  );
  if (nearby.length >= 4) return { score: 0.9, note: `${nearby.length} riders within ${CLUSTER_DIST}km — cluster fraud signal` };
  if (nearby.length >= 2) return { score: 0.4, note: `${nearby.length} riders nearby — mild cluster` };
  return { score: 0, note: 'No suspicious clustering' };
}

export function computeFraudScore(rd: RiderDay, allRiderDays: RiderDay[]): FraudResult {
  const loc = locationScore(rd);
  const mot = motionScore(rd);
  const act = activityScore(rd);
  const clu = clusterScore(rd, allRiderDays);

  const weightedScore = loc.score * 0.35 + mot.score * 0.25 + act.score * 0.15 + clu.score * 0.25;
  const score = Math.round(weightedScore * 100) / 100;

  const label: FraudResult['label'] = score < 0.3 ? 'legit' : score < 0.7 ? 'suspicious' : 'fraud';

  const explanation: string[] = [];
  if (loc.score > 0) explanation.push(loc.note);
  if (mot.score > 0) explanation.push(mot.note);
  if (act.score > 0) explanation.push(act.note);
  if (clu.score > 0) explanation.push(clu.note);
  if (explanation.length === 0) explanation.push('All checks passed — no fraud indicators');

  return {
    riderId: rd.riderId,
    score,
    label,
    locationScore: loc.score,
    motionScore: mot.score,
    activityScore: act.score,
    clusterScore: clu.score,
    explanation,
  };
}

export function detectAllFraud(sim: DaySimulation): FraudResult[] {
  return sim.riderDays.map(rd => computeFraudScore(rd, sim.riderDays));
}
