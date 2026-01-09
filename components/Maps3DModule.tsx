
import React, { useState, useEffect } from 'react';
import { earthEngineService } from '../services/earthEngineService';

const Maps3DModule: React.FC = () => {
  const [rotation, setRotation] = useState(45);
  const [pitch, setPitch] = useState(60);
  const [zoom, setZoom] = useState(1.2);
  const [activeLayer, setActiveLayer] = useState<'sat' | 'ndvi' | 'topo'>('sat');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full bg-black relative overflow-hidden flex flex-col">
      {/* HUD - Heads Up Display */}
      <div className="absolute inset-0 pointer-events-none z-20 border-[20px] border-emerald-500/5">
        {/* Miras e Vetores */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-emerald-500/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-64 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
        
        {/* Telemetria Lateral */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 space-y-4">
          <div className="h-32 w-1 bg-white/10 relative rounded-full overflow-hidden">
             <div className="absolute bottom-0 w-full bg-emerald-500 transition-all duration-500" style={{ height: `${(pitch/90)*100}%` }}></div>
          </div>
          <span className="text-[8px] font-black text-emerald-500 tracking-widest uppercase vertical-text">PITCH_ANGLE</span>
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 space-y-4 text-right">
          <div className="text-emerald-500 font-mono text-xs">
            <p>LAT: -17.7912</p>
            <p>LON: -50.9201</p>
            <p className="mt-2 text-white">ALT: 450m MSL</p>
          </div>
          <div className="h-32 w-1 ml-auto bg-white/10 relative rounded-full overflow-hidden">
             <div className="absolute bottom-0 w-full bg-blue-500 transition-all duration-500" style={{ height: `${(zoom/2)*100}%` }}></div>
          </div>
        </div>
      </div>

      {/* 3D Scene Container */}
      <div className="flex-1 flex items-center justify-center perspective-deep">
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-emerald-500 text-[10px] font-black mt-4 uppercase tracking-[0.3em]">Iniciando Renderização 3D Earth Engine</p>
          </div>
        ) : (
          <div 
            className="relative w-[120%] h-[120%] transition-transform duration-1000 ease-out"
            style={{ 
              transform: `rotateX(${pitch}deg) rotateZ(${rotation}deg) scale(${zoom})`,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Ground Plane */}
            <div className="absolute inset-0 bg-emerald-950 shadow-[0_0_100px_rgba(16,185,129,0.2)]" style={{ transform: 'translateZ(-20px)' }}></div>
            
            {/* Satellite Mesh */}
            <img 
              src={earthEngineService.getLayerUrl(activeLayer === 'topo' ? 'moisture' : activeLayer, -17.7912, -50.9201)}
              className="absolute inset-0 w-full h-full object-cover opacity-80 border-2 border-emerald-500/30"
              alt="3D Surface"
            />

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            
            {/* Floating Data Points */}
            <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_15px_#10b981] animate-ping" style={{ transform: 'translateZ(40px)' }}></div>
            <div className="absolute top-1/4 left-1/3 bg-black/80 backdrop-blur-md px-2 py-1 border border-emerald-500 rounded-md" style={{ transform: 'translateZ(50px) rotateX(-60deg) rotateZ(-45deg)' }}>
               <span className="text-[8px] font-black text-white whitespace-nowrap">TALHÃO A1 - NDVI 0.82</span>
            </div>

            <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_15px_#fbbf24] animate-ping" style={{ transform: 'translateZ(20px)' }}></div>
            <div className="absolute bottom-1/3 right-1/4 bg-black/80 backdrop-blur-md px-2 py-1 border border-amber-500 rounded-md" style={{ transform: 'translateZ(30px) rotateX(-60deg) rotateZ(-45deg)' }}>
               <span className="text-[8px] font-black text-white whitespace-nowrap">DÉFICIT HÍDRICO DETECTADO</span>
            </div>
          </div>
        )}
      </div>

      {/* 3D Controls Bar */}
      <div className="bg-emerald-950/80 backdrop-blur-xl p-6 border-t border-emerald-500/20 z-30">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
             <i className="fas fa-cube text-emerald-400"></i> Motor Espacial 3D
           </h3>
           <div className="flex gap-2">
             <button 
                onClick={() => setActiveLayer('sat')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeLayer === 'sat' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-emerald-500'}`}
             >S-2 Real</button>
             <button 
                onClick={() => setActiveLayer('ndvi')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeLayer === 'ndvi' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-emerald-500'}`}
             >NDVI Mesh</button>
             <button 
                onClick={() => setActiveLayer('topo')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeLayer === 'topo' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-emerald-500'}`}
             >Topografia</button>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[8px] font-black text-emerald-400 uppercase">
              <span>Rotação</span>
              <span>{rotation}°</span>
            </div>
            <input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full accent-emerald-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[8px] font-black text-emerald-400 uppercase">
              <span>Inclinação</span>
              <span>{pitch}°</span>
            </div>
            <input type="range" min="0" max="85" value={pitch} onChange={(e) => setPitch(parseInt(e.target.value))} className="w-full accent-emerald-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[8px] font-black text-emerald-400 uppercase">
              <span>Zoom</span>
              <span>{zoom.toFixed(1)}x</span>
            </div>
            <input type="range" min="0.5" max="2.5" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
          </div>
        </div>
      </div>

      <style>{`
        .perspective-deep {
          perspective: 1200px;
        }
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
};

export default Maps3DModule;
