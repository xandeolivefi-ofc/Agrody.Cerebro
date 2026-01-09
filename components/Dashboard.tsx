
import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_MARKET } from '../constants';
import { WeatherData, FarmData } from '../types';
import { fetchWeather } from '../services/weatherService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  farmData: FarmData;
}

const nvdichartData = [
  { name: 'Sem 1', saude: 70 },
  { name: 'Sem 2', saude: 75 },
  { name: 'Sem 3', saude: 82 },
  { name: 'Sem 4', saude: 88 },
];

const Dashboard: React.FC<DashboardProps> = ({ farmData }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const loadWeather = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingWeather(true);
    else setRefreshing(true);
    
    try {
      let lat = -17.7912;
      let lon = -50.9201;

      const getPosition = () => new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      try {
        if (navigator.geolocation) {
          const position = await getPosition();
          lat = position.coords.latitude;
          lon = position.coords.longitude;
        }
      } catch (e) {
        console.warn("Usando localização padrão (Rio Verde)");
      }

      const data = await fetchWeather(lat, lon);
      setWeather(data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.error("Error loading weather:", error);
    } finally {
      setLoadingWeather(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
    
    // Auto-refresh a cada 10 minutos
    const interval = setInterval(() => {
      loadWeather(true);
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadWeather]);

  return (
    <div className="p-4 space-y-4">
      {/* Weather Header com Integração Open-Meteo */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-emerald-100 min-h-[160px] relative overflow-hidden">
        {loadingWeather ? (
          <div className="w-full flex flex-col items-center justify-center py-10">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em]">Sincronizando Estação...</p>
          </div>
        ) : weather ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="text-5xl drop-shadow-sm">
                  <i className={`fas ${weather.icon}`}></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-4xl font-black text-emerald-950 tracking-tighter">{weather.temp}°C</h3>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Sensação</span>
                      <span className="text-xs font-black text-emerald-600">{weather.apparentTemp}°C</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-[10px] font-black uppercase mt-1 tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    {weather.condition}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <button 
                  onClick={() => loadWeather()}
                  disabled={refreshing}
                  className={`w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm active:scale-95 transition-all ${refreshing ? 'animate-spin' : ''}`}
                >
                  <i className="fas fa-sync-alt text-xs"></i>
                </button>
                <div className="text-right">
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest block">Telemetria Live</span>
                  <span className="text-[9px] font-black text-gray-400">{lastUpdated}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <WeatherMiniStat icon="fa-droplet" value={`${weather.humidity}%`} label="Umidade" color="text-blue-500" />
              <WeatherMiniStat icon="fa-umbrella" value={`${weather.rainProb}%`} label="Chuva" color="text-indigo-500" />
              <WeatherMiniStat icon="fa-cloud-rain" value={`${weather.precipitation}mm`} label="Volume" color="text-blue-600" />
              <WeatherMiniStat icon="fa-wind" value={`${weather.windSpeed}`} label="Vento" color="text-emerald-500" />
            </div>
            
            {/* Hourly Temp Chart */}
            <div className="h-28 w-full mt-4 bg-gray-50/50 rounded-2xl p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weather.hourlyTemps}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ fontSize: '10px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    labelStyle={{ fontWeight: 'bold' }}
                    itemStyle={{ color: '#fbbf24', fontWeight: '900' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#fbbf24" 
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-[7px] text-gray-400 font-black px-2 uppercase tracking-widest mt-1">
                <span>Agora</span>
                <span>Proximas 24 Horas</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-red-500 text-xs text-center w-full py-10 font-black uppercase tracking-widest">
            <i className="fas fa-triangle-exclamation mr-2"></i>
            Falha na Conexão Estação
          </div>
        )}
      </div>

      {/* Health Score Card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] font-black text-emerald-800 uppercase tracking-[0.2em]">Saúde Safra</span>
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-4xl font-black text-emerald-950">{farmData.healthScore}</span>
            <span className="text-emerald-600 text-sm font-black">%</span>
          </div>
          <p className="text-[9px] text-emerald-700 font-bold leading-tight">Manejo otimizado em {farmData.name}.</p>
        </div>
        <div className="bg-blue-50 rounded-[2rem] p-6 border border-blue-100 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] font-black text-blue-800 uppercase tracking-[0.2em]">Área Monitorada</span>
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-3xl font-black text-blue-950">{farmData.area}</span>
            <span className="text-blue-600 text-xs font-black uppercase">HA</span>
          </div>
          <p className="text-[9px] text-blue-700 font-bold leading-tight">Total georreferenciado via Sentinel-2.</p>
        </div>
      </div>

      {/* NDVI Evolution Chart */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-black text-xs text-gray-800 uppercase tracking-widest">Evolução NDVI ({farmData.location})</h4>
          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black tracking-tighter">VIGOR ALTO</span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={nvdichartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
              <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontWeight: 'bold'}} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '10px' }}
              />
              <Line 
                type="monotone" 
                dataKey="saude" 
                stroke="#10b981" 
                strokeWidth={5} 
                dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} 
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Market Ticker */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h4 className="font-black text-xs text-gray-800 uppercase tracking-widest">Bolsa Brasileira (B3)</h4>
          <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">Tempo Real <i className="fas fa-chevron-right ml-1"></i></span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {MOCK_MARKET.map((item, idx) => (
            <div key={idx} className="flex-shrink-0 bg-white p-4 rounded-2xl border border-gray-100 min-w-[150px] shadow-sm">
              <p className="text-[8px] text-gray-400 font-black uppercase mb-2 tracking-tighter truncate">{item.commodity}</p>
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-gray-800">R$ {item.price.toFixed(2)}</span>
                <div className={`flex items-center text-[9px] font-black ${item.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  <i className={`fas fa-caret-${item.change >= 0 ? 'up' : 'down'} mr-1`}></i>
                  {Math.abs(item.change)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Urgent Alerts */}
      <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-200 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs">
            <i className="fas fa-triangle-exclamation"></i>
          </div>
          <h4 className="font-black text-xs text-amber-900 uppercase tracking-widest">Recomendação Digital</h4>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed font-medium">
          {weather && weather.rainProb > 70 ? 
            "Atenção: Precipitação severa prevista para sua localização. Suspenda aplicações químicas foliares." :
            `Condições em ${farmData.name} ideais: Clima estável permite otimização da janela de plantio/colheita nas próximas 48h.`
          }
        </p>
      </div>
    </div>
  );
};

const WeatherMiniStat: React.FC<{ icon: string; value: string; label: string; color: string }> = ({ icon, value, label, color }) => (
  <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100 flex flex-col items-center">
    <i className={`fas ${icon} ${color} text-xs mb-1.5`}></i>
    <span className="text-[11px] font-black text-gray-800 tracking-tighter">{value}</span>
    <span className="text-[7px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{label}</span>
  </div>
);

export default Dashboard;
