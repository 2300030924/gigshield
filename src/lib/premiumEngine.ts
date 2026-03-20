import type { TrafficData, WeatherData, PremiumResult, RiderDay, Rider } from './types';

export function calculatePremium(
  rider: Rider,
  riderDay: RiderDay,
  traffic: TrafficData,
  weather: WeatherData
): PremiumResult {
  // Base rate 10-15%
  let rate = 0.12;

  // High traffic → lower rate (riders earn less, reduce burden)
  if (traffic.congestionLevel > 0.5) rate -= 0.02;

  // High weather risk → slightly higher
  if (weather.rainfall > 20 || weather.aqi > 150) rate += 0.02;

  rate = Math.max(0.10, Math.min(0.15, rate));

  const premium = Math.round(riderDay.actualEarnings * rate * 100) / 100;

  return {
    riderId: rider.id,
    premium,
    rate: Math.round(rate * 1000) / 10,
  };
}
