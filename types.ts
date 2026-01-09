
export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  BRAIN = 'BRAIN',
  VISION = 'VISION',
  FINANCE = 'FINANCE',
  MAPS = 'MAPS',
  MAPS_3D = 'MAPS_3D',
  SIMULATION = 'SIMULATION',
  ANALYST = 'ANALYST',
  SOIL = 'SOIL'
}

export interface FarmData {
  id: string;
  name: string;
  culture: string;
  area: number;
  location: string;
  coordinates?: { lat: number; lon: number };
  lastAnalysis: string;
  healthScore: number;
  referenceImages?: string[];
}

export interface MarketPrice {
  commodity: string;
  price: number;
  change: number;
  unit: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface HourlyTemp {
  time: string;
  temp: number;
}

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  rainProb: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  apparentTemp: number;
  hourlyTemps: HourlyTemp[];
}

export interface SpatialMetrics {
  ndvi: number;
  evi: number;
  soilMoisture: number;
  surfaceTemp: number;
  timestamp: string;
}

export interface NLPAnalysis {
  sentiment: 'positivo' | 'neutro' | 'negativo' | 'urgente';
  score: number;
  summary: string;
  entities: {
    text: string;
    type: string;
    importance: number;
  }[];
  actionItems: string[];
}

export interface SoilNutrients {
  ph: number;
  mo: number; // Materia Organica %
  p: number;  // Fosforo mg/dm3
  k: number;  // Potassio cmolc/dm3
  ctc: number;
  v_percent: number; // Saturação por bases
}

export interface FertilizationStep {
  timing: string;
  product: string;
  dosage: number;
  unit: string;
  rationale: string;
}

export interface FertilizationPrescription {
  soilStatus: 'pobre' | 'medio' | 'bom' | 'excelente';
  limitations: string[];
  plan: FertilizationStep[];
  expectedYieldIncrease: number;
}

// Added IBGE related interfaces to fix module errors
export interface IBGECNAE {
  id: string;
  descricao: string;
  grupo: {
    divisao: {
      descricao: string;
      secao: {
        descricao: string;
      };
    };
  };
}

export interface IBGEUrbanAgglomeration {
  id: number;
  nome: string;
}

export interface IBGEStatisticProduct {
  id: number;
  nome: string;
  alias?: string;
  descricao: string;
}

export interface IBGEIndicator {
  id: number;
  indicador: string;
  unidade?: {
    classe: string;
  };
}

export interface IBGECountryIndicator {
  id: number;
  indicador: string;
  unidade: string;
  series: {
    pais: {
      nome: string;
    };
    serie: { [year: string]: any }[];
  }[];
}

export interface IBGEGeographicName {
  id: number;
  nome: string;
  categoria: string;
  tipo: string;
  municipio: string;
  uf: string;
}
