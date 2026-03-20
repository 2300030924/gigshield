import type { Rider, RiderDay, PeerValidation } from './types';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function peerValidation(
  rider: Rider,
  riderDay: RiderDay,
  allRiders: Rider[],
  allRiderDays: RiderDay[],
  clusterRadiusKm: number = 5
): PeerValidation {
  const peers = allRiders.filter(r =>
    r.id !== rider.id && haversineKm(rider.lat, rider.lng, r.lat, r.lng) < clusterRadiusKm
  );

  const peerDays = allRiderDays.filter(rd => peers.some(p => p.id === rd.riderId));
  const groupAvg = peerDays.length > 0
    ? peerDays.reduce((sum, rd) => sum + rd.actualDeliveries, 0) / peerDays.length
    : rider.deliveriesPerDay;

  const riderDropped = riderDay.actualDeliveries < groupAvg * 0.7;
  const groupDropped = groupAvg < rider.deliveriesPerDay * 0.7;

  // Anomaly = only this rider underperforming, group is fine
  const isAnomaly = riderDropped && !groupDropped;

  return {
    riderId: rider.id,
    isAnomaly,
    groupAvgDeliveries: Math.round(groupAvg * 10) / 10,
    riderDeliveries: riderDay.actualDeliveries,
    groupSize: peers.length,
  };
}
