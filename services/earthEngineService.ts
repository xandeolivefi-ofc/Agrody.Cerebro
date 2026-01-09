
import { SpatialMetrics } from '../types';

/**
 * Este serviço simula a interface com a REST API do Google Earth Engine.
 * Em um cenário real, ele consultaria o endpoint:
 * https://earthengine.googleapis.com/v1/projects/{project}/thumbnails
 */
export const earthEngineService = {
  fetchSpatialMetrics: async (lat: number, lon: number): Promise<SpatialMetrics> => {
    // Simulando latência de processamento de bandas espectrais (Sentinel-2)
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Lógica para variar os dados baseada em lat/lon para parecer real
    const hash = Math.abs(lat + lon);
    const seed = hash - Math.floor(hash);
    
    // Simulação de Índices Espectrais
    const ndvi = parseFloat((0.65 + (seed * 0.25)).toFixed(2));
    const evi = parseFloat((ndvi * 0.88).toFixed(2));
    const moisture = Math.floor(15 + (seed * 25));
    const temp = Math.floor(22 + (seed * 8));

    return {
      ndvi,
      evi,
      soilMoisture: moisture,
      surfaceTemp: temp,
      timestamp: new Date().toISOString()
    };
  },

  getLayerUrl: (layer: 'ndvi' | 'moisture' | 'sat', lat: number, lon: number): string => {
    // URLs de imagens que representam as camadas processadas pelo GEE
    const maps: Record<string, string> = {
      sat: `https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80`,
      ndvi: `https://img.freepik.com/premium-photo/aerial-view-green-agricultural-fields-abstract-nature-background_127089-21584.jpg`,
      moisture: `https://img.freepik.com/premium-photo/aerial-view-meadow-with-river-top-view-green-nature-background_127089-21443.jpg`
    };
    return maps[layer];
  }
};
