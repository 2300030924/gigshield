import type { Rider, WeatherData, TrafficData, DaySimulation, RiderDay, ScenarioType } from './types';

const FIRST_NAMES = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Ayaan','Krishna','Ishaan','Shaurya','Atharv','Advik','Pranav','Advaith','Dhruv','Kabir','Ritvik','Aarush','Darsh','Rohan','Karan','Amit','Suresh','Vijay','Rahul','Manoj','Pradeep','Rajesh','Nikhil'];
const LAST_NAMES = ['Kumar','Singh','Sharma','Patel','Das','Verma','Reddy','Nair','Gupta','Mehta','Joshi','Rao','Mishra','Shah','Thakur','Yadav','Pillai','Iyer','Bhat','Chopra'];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function gaussianRandom(rng: () => number, mean: number, stdDev: number): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

export function generateRiders(count: number = 200, seed: number = 42): Rider[] {
  const rng = seededRandom(seed);
  const riders: Rider[] = [];
  
  // Mumbai area coordinates
  const baseLat = 19.076;
  const baseLng = 72.8777;
  
  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    riders.push({
      id: `R${String(i + 1).padStart(4, '0')}`,
      name: `${firstName} ${lastName}`,
      dailyWorkingHours: Math.round(gaussianRandom(rng, 9, 2) * 10) / 10,
      avgSpeed: Math.round(gaussianRandom(rng, 25, 5) * 10) / 10,
      deliveriesPerDay: Math.max(5, Math.round(gaussianRandom(rng, 18, 4))),
      lat: baseLat + (rng() - 0.5) * 0.15,
      lng: baseLng + (rng() - 0.5) * 0.15,
      earningsPerDelivery: Math.round(gaussianRandom(rng, 45, 10) * 100) / 100,
    });
  }
  return riders;
}

function generateWeather(scenario: ScenarioType, rng: () => number): WeatherData {
  switch (scenario) {
    case 'heavy_rain':
      return { rainfall: 40 + rng() * 60, temperature: 24 + rng() * 4, aqi: 80 + rng() * 70 };
    case 'normal':
    case 'individual_lazy':
    case 'fraud_attack':
    default:
      return { rainfall: rng() * 5, temperature: 28 + rng() * 6, aqi: 40 + rng() * 40 };
  }
}

function generateTraffic(scenario: ScenarioType, rng: () => number): TrafficData {
  if (scenario === 'heavy_rain') return { congestionLevel: 0.6 + rng() * 0.3 };
  return { congestionLevel: 0.2 + rng() * 0.3 };
}

export function simulateDay(
  riders: Rider[],
  scenario: ScenarioType,
  seed: number = 123
): DaySimulation {
  const rng = seededRandom(seed);
  const weather = generateWeather(scenario, rng);
  const traffic = generateTraffic(scenario, rng);
  
  const lazyRiderIdx = scenario === 'individual_lazy' ? Math.floor(rng() * riders.length) : -1;
  const fraudRiderCount = scenario === 'fraud_attack' ? Math.min(12, Math.floor(riders.length * 0.06)) : 0;
  const fraudRiderIndices = new Set<number>();
  while (fraudRiderIndices.size < fraudRiderCount) {
    fraudRiderIndices.add(Math.floor(rng() * riders.length));
  }

  const riderDays: RiderDay[] = riders.map((rider, idx) => {
    let deliveryMultiplier = 1;
    let isFraudulent = false;
    let fraudType: RiderDay['fraudType'] = undefined;

    if (scenario === 'heavy_rain') {
      deliveryMultiplier = 0.4 + rng() * 0.3; // 40-70% of normal
    }

    if (idx === lazyRiderIdx) {
      deliveryMultiplier = 0.2 + rng() * 0.2;
      fraudType = 'lazy';
    }

    if (fraudRiderIndices.has(idx)) {
      isFraudulent = true;
      fraudType = rng() > 0.5 ? 'gps_spoof' : 'cluster_fraud';
      deliveryMultiplier = 0.15 + rng() * 0.2;
    }

    const actualDeliveries = Math.max(0, Math.round(rider.deliveriesPerDay * deliveryMultiplier + gaussianRandom(rng, 0, 1)));
    const actualEarnings = actualDeliveries * rider.earningsPerDelivery * (0.9 + rng() * 0.2);
    const actualHours = Math.min(rider.dailyWorkingHours, actualDeliveries * 0.5 + rng() * 2);

    // GPS vs cell tower
    let gpsDist = 0;
    let cellLat = rider.lat + (rng() - 0.5) * 0.005;
    let cellLng = rider.lng + (rng() - 0.5) * 0.005;
    let gpsLat = rider.lat + (rng() - 0.5) * 0.008;
    let gpsLng = rider.lng + (rng() - 0.5) * 0.008;

    if (fraudType === 'gps_spoof') {
      gpsLat = rider.lat + (rng() - 0.5) * 0.12; // far away
      gpsLng = rider.lng + (rng() - 0.5) * 0.12;
    }

    if (fraudType === 'cluster_fraud') {
      // Cluster around a single point
      gpsLat = 19.05 + rng() * 0.002;
      gpsLng = 72.85 + rng() * 0.002;
      cellLat = gpsLat + (rng() - 0.5) * 0.001;
      cellLng = gpsLng + (rng() - 0.5) * 0.001;
    }

    const speedVariance = isFraudulent ? rng() * 2 : 5 + rng() * 15;
    const movementRandomness = isFraudulent ? rng() * 0.15 : 0.3 + rng() * 0.7;

    return {
      riderId: rider.id,
      actualDeliveries,
      actualEarnings: Math.round(actualEarnings * 100) / 100,
      actualHours: Math.round(actualHours * 10) / 10,
      gpsLat,
      gpsLng,
      cellTowerLat: cellLat,
      cellTowerLng: cellLng,
      speedVariance: Math.round(speedVariance * 100) / 100,
      movementRandomness: Math.round(movementRandomness * 100) / 100,
      appActivity: !isFraudulent || rng() > 0.6,
      isFraudulent,
      fraudType,
    };
  });

  const dateMap: Record<ScenarioType, string> = {
    normal: '2025-03-15',
    heavy_rain: '2025-03-16',
    individual_lazy: '2025-03-17',
    fraud_attack: '2025-03-18',
  };

  return {
    date: dateMap[scenario],
    weather,
    traffic,
    disasterEvent: scenario === 'heavy_rain',
    riderDays,
  };
}
