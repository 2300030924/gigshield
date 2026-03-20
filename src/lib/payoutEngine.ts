import type { RiderProfile, RiderDay, FraudResult, TriggerResult, PayoutResult } from './types';

export function calculatePayout(
  profile: RiderProfile,
  riderDay: RiderDay,
  trigger: TriggerResult,
  fraud: FraudResult
): PayoutResult {
  const expectedEarnings = profile.avgEarningsPerDay;
  const actualEarnings = riderDay.actualEarnings;
  const rawPayout = Math.max(0, 0.8 * (expectedEarnings - actualEarnings));
  const amount = Math.round(rawPayout * 100) / 100;

  if (!trigger.triggered) {
    return { riderId: profile.riderId, amount: 0, expectedEarnings, actualEarnings, status: 'blocked', reason: 'No trigger event detected' };
  }

  if (fraud.label === 'fraud') {
    return { riderId: profile.riderId, amount, expectedEarnings, actualEarnings, status: 'blocked', reason: `Fraud detected (score ${fraud.score})` };
  }

  if (fraud.label === 'suspicious') {
    return { riderId: profile.riderId, amount, expectedEarnings, actualEarnings, status: 'delayed', reason: `Under review (fraud score ${fraud.score})` };
  }

  return { riderId: profile.riderId, amount, expectedEarnings, actualEarnings, status: 'paid', reason: 'Valid claim — instant payout' };
}
