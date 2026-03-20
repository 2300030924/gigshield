export interface Rider {
  id: string;
  name: string;
  dailyWorkingHours: number;
  avgSpeed: number;
  deliveriesPerDay: number;
  lat: number;
  lng: number;
  earningsPerDelivery: number;
}

export interface WeatherData {
  rainfall: number;      // mm
  temperature: number;   // celsius
  aqi: number;           // 0-500
}

export interface TrafficData {
  congestionLevel: number; // 0-1
}

export interface DaySimulation {
  date: string;
  weather: WeatherData;
  traffic: TrafficData;
  disasterEvent: boolean;
  riderDays: RiderDay[];
}

export interface RiderDay {
  riderId: string;
  actualDeliveries: number;
  actualEarnings: number;
  actualHours: number;
  gpsLat: number;
  gpsLng: number;
  cellTowerLat: number;
  cellTowerLng: number;
  speedVariance: number;
  movementRandomness: number;
  appActivity: boolean;
  isFraudulent: boolean;
  fraudType?: 'gps_spoof' | 'cluster_fraud' | 'lazy';
}

export interface RiderProfile {
  riderId: string;
  name: string;
  avgDeliveriesPerDay: number;
  avgEarningsPerDay: number;
  avgWorkingHours: number;
  totalPremiumPaid: number;
}

export interface PremiumResult {
  riderId: string;
  premium: number;
  rate: number;
}

export interface TriggerResult {
  riderId: string;
  triggered: boolean;
  reason: string;
  expectedDeliveries: number;
  actualDeliveries: number;
  dropPercent: number;
}

export interface PayoutResult {
  riderId: string;
  amount: number;
  expectedEarnings: number;
  actualEarnings: number;
  status: 'paid' | 'delayed' | 'blocked';
  reason: string;
}

export interface FraudResult {
  riderId: string;
  score: number;
  label: 'legit' | 'suspicious' | 'fraud';
  locationScore: number;
  motionScore: number;
  activityScore: number;
  clusterScore: number;
  explanation: string[];
}

export interface PeerValidation {
  riderId: string;
  isAnomaly: boolean;
  groupAvgDeliveries: number;
  riderDeliveries: number;
  groupSize: number;
}

export type ScenarioType = 'normal' | 'heavy_rain' | 'individual_lazy' | 'fraud_attack';
