import type { Rider, RiderProfile } from './types';

export function buildRiderProfile(rider: Rider): RiderProfile {
  return {
    riderId: rider.id,
    name: rider.name,
    avgDeliveriesPerDay: rider.deliveriesPerDay,
    avgEarningsPerDay: Math.round(rider.deliveriesPerDay * rider.earningsPerDelivery * 100) / 100,
    avgWorkingHours: rider.dailyWorkingHours,
    totalPremiumPaid: 0,
  };
}

export function buildAllProfiles(riders: Rider[]): Map<string, RiderProfile> {
  const map = new Map<string, RiderProfile>();
  riders.forEach(r => map.set(r.id, buildRiderProfile(r)));
  return map;
}
