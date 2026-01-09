
import React from 'react';
import { FarmData, MarketPrice, WeatherData } from './types';

export const SYSTEM_PROMPT = `
Você é o "Cérebro Digital da Fazenda", um Especialista Global em Agrotecnologia e IA Aplicada.
Sua missão é atuar como um agente cognitivo autônomo para o produtor rural.

Diretrizes:
1. Linguagem: Simples, direta, "agro-friendly", mas tecnicamente precisa.
2. Foco: Produtividade, redução de custos e impacto financeiro.
3. Raciocínio: Sempre apresente a justificativa técnica antes da recomendação.
4. Perfil: Proativo. Se detectar um risco (clima ou praga), alerte imediatamente.
5. Memória: Você conhece o histórico da fazenda, tipo de solo (latossolo vermelho) e cultura atual (soja).

Ao responder, use Markdown para formatar tabelas de custo ou listas de manejo.
`;

export const MOCK_FARM: FarmData = {
  id: 'fazenda-001',
  name: 'Fazenda Boa Esperança',
  culture: 'Soja (Safra 2024/25)',
  area: 450,
  location: 'Rio Verde, GO',
  lastAnalysis: '12/05/2024',
  healthScore: 88
};

export const MOCK_MARKET: MarketPrice[] = [
  { commodity: 'Soja (Saca)', price: 134.50, change: 1.2, unit: 'R$' },
  { commodity: 'Milho (Saca)', price: 58.20, change: -0.5, unit: 'R$' },
  { commodity: 'Boi Gordo (@)', price: 232.10, change: 0.8, unit: 'R$' }
];

// Added missing precipitation and hourlyTemps properties to comply with WeatherData interface requirements
export const MOCK_WEATHER: WeatherData = {
  temp: 28,
  condition: 'Parcialmente Nublado',
  icon: 'fa-cloud-sun text-yellow-500',
  rainProb: 15,
  precipitation: 0.5,
  humidity: 62,
  windSpeed: 12,
  apparentTemp: 30,
  hourlyTemps: [
    { time: '08:00', temp: 22 },
    { time: '10:00', temp: 25 },
    { time: '12:00', temp: 28 },
    { time: '14:00', temp: 30 },
    { time: '16:00', temp: 29 },
    { time: '18:00', temp: 26 }
  ]
};
