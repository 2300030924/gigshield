import type { WeatherData, RiderProfile, RiderDay, TriggerResult } from './types';

const RAINFALL_THRESHOLD = 20;
const AQI_THRESHOLD = 150;
const TEMP_THRESHOLD = 42;
const DROP_THRESHOLD = 0.25;

export function checkTrigger(
  profile: RiderProfile,
  riderDay: RiderDay,
  weather: WeatherData
): TriggerResult {
  const weatherDisruption =
    weather.rainfall > RAINFALL_THRESHOLD ||
    weather.aqi > AQI_THRESHOLD ||
    weather.temperature > TEMP_THRESHOLD;

  const dropPercent = profile.avgDeliveriesPerDay > 0
    ? (profile.avgDeliveriesPerDay - riderDay.actualDeliveries) / profile.avgDeliveriesPerDay
    : 0;

  const triggered = weatherDisruption && dropPercent > DROP_THRESHOLD;

  const reasons: string[] = [];
  if (weather.rainfall > RAINFALL_THRESHOLD) reasons.push(`Rainfall ${weather.rainfall.toFixed(0)}mm > ${RAINFALL_THRESHOLD}mm`);
  if (weather.aqi > AQI_THRESHOLD) reasons.push(`AQI ${weather.aqi.toFixed(0)} > ${AQI_THRESHOLD}`);
  if (weather.temperature > TEMP_THRESHOLD) reasons.push(`Temp ${weather.temperature.toFixed(0)}°C > ${TEMP_THRESHOLD}°C`);
  if (dropPercent > DROP_THRESHOLD) reasons.push(`Delivery drop ${(dropPercent * 100).toFixed(0)}% > 25%`);

  return {
    riderId: profile.riderId,
    triggered,
    reason: triggered ? reasons.join('; ') : weatherDisruption ? 'Weather disruption but delivery drop < 25%' : 'No disruption detected',
    expectedDeliveries: profile.avgDeliveriesPerDay,
    actualDeliveries: riderDay.actualDeliveries,
    dropPercent: Math.round(dropPercent * 1000) / 10,
  };
}
