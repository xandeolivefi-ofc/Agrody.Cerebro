
import React, { useState, useEffect } from 'react';
import { earthEngineService } from '../services/earthEngineService';
import { geminiService } from '../services/geminiService';
import { ibgeService } from '../services/ibgeService';
import { SpatialMetrics, IBGEUrbanAgglomeration, IBGEGeographicName } from '../types';

const MapsModule: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<'sat' | 'ndvi' | 'moisture'>('sat');
  const [metrics, setMetrics] = useState<SpatialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat: -17.7912, lon: -50.9201 }); // Default Rio Verde
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [analyzingIA, setAnalyzingIA] = useState(false);

  // Estados IBGE Aglomerações
  const [urbanAgglom, setUrbanAgglom] = useState<IBGEUrbanAgglomeration | null>(null);
  const [agglomInsight, setAgglomInsight] = useState<string | null>(null);
  const [loadingUrban, setLoadingUrban] = useState(false);

  // Estados IBGE BNGB (Nomes Geográficos)
  const [geoName, setGeoName] = useState<IBGEGeographicName | null>(null);
  const [geoInsight, setGeoInsight] = useState<string | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [geoId, setGeoId] = useState('21404'); // Exemplo: Rio Verde (Hidrografia)

  useEffect(() => {
    const initMap = async () => {
      setLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const newCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            setCoords(newCoords);
            const data = await earthEngineService.fetchSpatialMetrics(newCoords.lat, newCoords.lon);
            setMetrics(data);
            setLoading(false);
          },
          async () => {
            const data = await earthEngineService.fetchSpatialMetrics(coords.lat, coords.lon);
            setMetrics(data);
            setLoading(false);
          }
        );
      } else {
        const data = await earthEngineService.fetchSpatialMetrics(coords.lat, coords.lon);
        setMetrics(data);
        setLoading(false);
      }
    };
    initMap();
    loadRegionalContext();
    handleGeoLookup();
  }, []);

  const loadRegionalContext = async () => {
    setLoadingUrban(true);
    const aggloms = await ibgeService.fetchUrbanAgglomerations();
    if (aggloms.length > 0) {
      const target = aggloms.find(a => a.nome.includes('Goiânia')) || aggloms[0];
      const detail = await ibgeService.fetchUrbanAgglomerationDetail(target.id);
      setUrbanAgglom(detail);
      if (detail) {
        const insight = await geminiService.analyzeTerritorialImpact(detail);
        setAgglomInsight(insight);
      }
    }
    setLoadingUrban(false);
  };

  const handleGeoLookup = async () => {
    setLoadingGeo(true);
    const data = await ibgeService.fetchGeographicName(geoId);
    if (data) {
      setGeoName(data);
      const insight = await geminiService.analyzeGeographicIdentity(data);
      setGeoInsight(insight);
    }
    setLoadingGeo(false);
  };

  const handleAIAnalysis = async () => {
    if (!metrics || analyzingIA) return;
    setAnalyzingIA(true);
    const result = await geminiService.analyzeSpatialData(metrics);
    setAiInsight(result || "Análise indisponível.");
    setAnalyzingIA(false);
  };

  return (
    <div className="h-full flex flex-col relative bg-gray-900">
      {/* Map View Area */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-40">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-emerald-400 font-black text-sm uppercase tracking-widest animate-pulse">Consultando Earth Engine...</p>
          </div>
        ) : null}

        <img 
          src={earthEngineService.getLayerUrl(activeLayer, coords.lat, coords.lon)} 
          className={`w-full h-full object-cover transition-all duration-1000 transform scale-110 ${loading ? 'opacity-30' : 'opacity-100'}`}
          alt="Satellite View"
        />

        <div className="absolute top-6 right-6 space-y-3 z-30">
          <MapControl active={activeLayer === 'sat'} onClick={() => setActiveLayer('sat')} icon="fas fa-satellite" label="SENTINEL-2" />
          <MapControl active={activeLayer === 'ndvi'} onClick={() => setActiveLayer('ndvi')} icon="fas fa-leaf" label="ÍNDICE NDVI" />
          <MapControl active={activeLayer === 'moisture'} onClick={() => setActiveLayer('moisture')} icon="fas fa-droplet" label="UMIDADE SOLO" />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
           <div className="w-12 h-12 border-2 border-emerald-400 rounded-full animate-ping opacity-30"></div>
           <div className="bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-400/50 -mt-6">
              <span className="text-[10px] font-black text-white whitespace-nowrap uppercase tracking-tighter">
                SCANNING: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
              </span>
           </div>
        </div>
      </div>

      {/* Earth Engine Data Sheet */}
      <div className="bg-white p-6 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] relative -mt-8 z-40 overflow-y-auto max-h-[60vh]">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-black text-xl text-emerald-950 leading-tight">Telemetria de Órbita</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Earth Engine • Sentinel-2 L2A</p>
          </div>
          <button 
            onClick={handleAIAnalysis}
            className="bg-emerald-950 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"
          >
            <i className="fas fa-brain"></i> Diagnóstico IA
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <MapStat label="NDVI" value={metrics?.ndvi?.toString() || '0.00'} sub="Vigor" color="emerald" />
          <MapStat label="EVI" value={metrics?.evi?.toString() || '0.00'} sub="Biomassa" color="green" />
          <MapStat label="UR SOLO" value={`${metrics?.soilMoisture || '0'}%`} sub="Água" color="blue" />
          <MapStat label="LST" value={`${metrics?.surfaceTemp || '0'}°C`} sub="Calor" color="amber" />
        </div>

        {/* Identidade Geográfica (BNGB) */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-map-location-dot text-emerald-600"></i> Identidade Geográfica (IBGE)
            </h4>
            {loadingGeo && <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>}
          </div>

          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={geoId}
              onChange={(e) => setGeoId(e.target.value)}
              placeholder="ID Geográfico (BNGB)"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-black outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button 
              onClick={handleGeoLookup}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95"
            >
              Consultar
            </button>
          </div>

          {geoName && (
            <div className="space-y-4 animate-slide-up">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <i className="fas fa-mountain-sun text-4xl text-emerald-900"></i>
                </div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Toponímia Oficial</p>
                <p className="text-lg font-black text-emerald-950">{geoName.nome}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[9px] bg-white text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 font-bold uppercase">{geoName.categoria}</span>
                  <span className="text-[9px] bg-white text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 font-bold uppercase">{geoName.tipo}</span>
                </div>
              </div>

              {geoInsight && (
                <div className="bg-emerald-950 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                     <i className="fas fa-landmark text-4xl"></i>
                   </div>
                   <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-2">Análise de Marco Territorial</h5>
                   <p className="text-xs leading-relaxed text-emerald-50 font-medium italic">
                     "{geoInsight}"
                   </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Regional Context (IBGE Aglomerações Urbanas) */}
        <div className="mt-8 pt-6 border-t border-gray-100">
           <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-city text-indigo-500"></i> Contexto Regional (IBGE)
              </h4>
           </div>

           {urbanAgglom && (
             <div className="space-y-4">
               <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Aglomeração Urbana</p>
                 <p className="text-lg font-black text-indigo-950">{urbanAgglom.nome}</p>
               </div>

               {agglomInsight && (
                 <div className="bg-indigo-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden animate-slide-up">
                    <button 
                      onClick={() => setAgglomInsight(null)} 
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Visão Estratégica</h5>
                    <p className="text-xs leading-relaxed text-indigo-50 font-medium">
                      {agglomInsight}
                    </p>
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const MapControl: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${
      active ? 'bg-emerald-500 text-white scale-110 rotate-3' : 'bg-black/40 backdrop-blur-md text-white/70 border border-white/10'
    }`}
  >
    <i className={`${icon} text-lg`}></i>
  </button>
);

const MapStat: React.FC<{ label: string; value: string; sub: string; color: string }> = ({ label, value, sub, color }) => {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    green: 'text-green-600'
  };
  return (
    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center">
      <span className="text-[8px] text-gray-400 font-black uppercase mb-1">{label}</span>
      <span className={`text-sm font-black ${colors[color]}`}>{value}</span>
      <span className="text-[7px] text-gray-400 font-bold uppercase mt-1">{sub}</span>
    </div>
  );
};

export default MapsModule;
