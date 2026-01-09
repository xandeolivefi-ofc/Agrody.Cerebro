
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ibgeService } from '../services/ibgeService';
import { geminiService } from '../services/geminiService';
import { IBGECNAE, IBGEStatisticProduct, IBGEIndicator, IBGECountryIndicator } from '../types';

const finData = [
  { name: 'Sementes', value: 850, color: '#059669' },
  { name: 'Fertilizantes', value: 1200, color: '#10b981' },
  { name: 'Defensivos', value: 950, color: '#34d399' },
  { name: 'Diesel', value: 450, color: '#6ee7b7' },
  { name: 'Mão de Obra', value: 600, color: '#a7f3d0' },
];

const FinanceModule: React.FC = () => {
  const [cnaeInput, setCnaeInput] = useState('01113'); 
  const [cnaeData, setCnaeData] = useState<IBGECNAE | null>(null);
  const [cnaeInsight, setCnaeInsight] = useState<string | null>(null);
  const [loadingCnae, setLoadingCnae] = useState(false);

  // Estados IBGE Estatísticas
  const [stats, setStats] = useState<IBGEStatisticProduct[]>([]);
  const [selectedStat, setSelectedStat] = useState<IBGEStatisticProduct | null>(null);
  const [statInsight, setStatInsight] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [analyzingStat, setAnalyzingStat] = useState(false);

  // Estados IBGE Países
  const [globalIndicators, setGlobalIndicators] = useState<IBGECountryIndicator[]>([]);
  const [selectedGlobal, setSelectedGlobal] = useState<IBGECountryIndicator | null>(null);
  const [globalInsight, setGlobalInsight] = useState<string | null>(null);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [analyzingGlobal, setAnalyzingGlobal] = useState(false);

  useEffect(() => {
    loadIBGEStats();
    loadGlobalIndicators();
  }, []);

  const loadIBGEStats = async () => {
    setLoadingStats(true);
    const data = await ibgeService.fetchStatistics();
    setStats(data);
    setLoadingStats(false);
  };

  const loadGlobalIndicators = async () => {
    setLoadingGlobal(true);
    // IDs sugeridos: 77823 (PIB), 77857 (Área Agrícola), 77825 (Inflação)
    const data = await ibgeService.fetchCountryIndicators('77823,77857,77825');
    setGlobalIndicators(data);
    setLoadingGlobal(false);
  };

  const handleGlobalAnalysis = async (indicator: IBGECountryIndicator) => {
    setSelectedGlobal(indicator);
    setGlobalInsight(null);
    setAnalyzingGlobal(true);
    const insight = await geminiService.analyzeGlobalMarketContext(indicator);
    setGlobalInsight(insight);
    setAnalyzingGlobal(false);
  };

  const handleCnaeLookup = async () => {
    if (!cnaeInput) return;
    setLoadingCnae(true);
    setCnaeData(null);
    setCnaeInsight(null);
    const data = await ibgeService.fetchCNAE(cnaeInput);
    if (data) {
      setCnaeData(data);
      const insight = await geminiService.interpretCNAE(data);
      setCnaeInsight(insight);
    }
    setLoadingCnae(false);
  };

  const handleStatAnalysis = async (product: IBGEStatisticProduct) => {
    setSelectedStat(product);
    setStatInsight(null);
    setAnalyzingStat(true);
    const insight = await geminiService.analyzeIBGEStatistic(product);
    setStatInsight(insight);
    setAnalyzingStat(false);
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Resumo Financeiro */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 text-center">
        <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Lucro Estimado/Ha</span>
        <h2 className="text-4xl font-black text-emerald-900 my-2">R$ 2.840</h2>
        <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm">
          <i className="fas fa-arrow-trend-up"></i>
          <span>+12% vs Safra Anterior</span>
        </div>
      </div>

      {/* NOVO: Painel de Contexto Global (IBGE Países) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-sm text-gray-800 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-globe-americas text-blue-600"></i> Benchmarking Global (IBGE)
          </h3>
          <span className="text-[10px] font-bold text-gray-400">MACROECONOMIA</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {loadingGlobal ? (
            <div className="flex gap-3">
              {[1,2,3].map(i => <div key={i} className="w-44 h-28 bg-gray-100 animate-pulse rounded-2xl"></div>)}
            </div>
          ) : globalIndicators.map((ind) => (
            <button 
              key={ind.id}
              onClick={() => handleGlobalAnalysis(ind)}
              className={`flex-shrink-0 w-44 p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                selectedGlobal?.id === ind.id 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg rotate-1 scale-105' 
                : 'bg-white border-gray-100 text-gray-800 hover:border-blue-200'
              }`}
            >
              <span className={`text-[8px] font-black uppercase tracking-tighter mb-1 block ${selectedGlobal?.id === ind.id ? 'text-blue-200' : 'text-blue-600'}`}>
                MERCADO MUNDIAL
              </span>
              <p className="text-[10px] font-black leading-tight mb-2 uppercase">{ind.indicador}</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-xs font-black">{ind.unidade}</span>
              </div>
              <div className={`absolute -right-2 -bottom-2 opacity-10 ${selectedGlobal?.id === ind.id ? 'text-white' : 'text-blue-900'}`}>
                <i className="fas fa-chart-area text-4xl"></i>
              </div>
            </button>
          ))}
        </div>

        {selectedGlobal && (
          <div className="animate-slide-up space-y-4">
            <div className="bg-blue-50 rounded-3xl p-6 shadow-sm border border-blue-100">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Comparativo Internacional</h4>
                  <span className="text-[9px] font-bold text-blue-400">FONTE: IBGE/WORLD BANK</span>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  {selectedGlobal.series.slice(0, 4).map((s, idx) => {
                    const lastYear = Object.keys(s.serie[0])[0];
                    return (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-blue-50 shadow-sm">
                        <p className="text-[9px] font-black text-gray-400 uppercase truncate">{s.pais.nome}</p>
                        <p className="text-xs font-black text-blue-900">{s.serie[0][lastYear]}</p>
                        <p className="text-[8px] text-gray-400">{lastYear}</p>
                      </div>
                    );
                  })}
               </div>
            </div>

            {analyzingGlobal ? (
               <div className="flex items-center justify-center py-6 gap-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">IA Analisando Fluxo de Exportação...</span>
               </div>
            ) : globalInsight && (
              <div className="bg-blue-950 text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <i className="fas fa-brain text-4xl"></i>
                </div>
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-3">Veredito do Comércio Exterior</h5>
                <p className="text-xs leading-relaxed text-blue-50 font-medium italic">
                  "{globalInsight}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gráfico de Custos */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-sm mb-4">Composição de Custo Local (R$)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={finData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {finData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Painel de Indicadores de Safra Nacional (IBGE Estatísticas) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-sm text-gray-800 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-chart-pie text-emerald-600"></i> Inteligência Nacional (IBGE)
          </h3>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {loadingStats ? (
            <div className="flex gap-3">
              {[1,2,3].map(i => <div key={i} className="w-40 h-24 bg-gray-100 animate-pulse rounded-2xl"></div>)}
            </div>
          ) : stats.map((stat) => (
            <button 
              key={stat.id}
              onClick={() => handleStatAnalysis(stat)}
              className={`flex-shrink-0 w-40 p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                selectedStat?.id === stat.id 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg rotate-1 scale-105' 
                : 'bg-white border-gray-100 text-gray-800 hover:border-emerald-200'
              }`}
            >
              <span className={`text-[8px] font-black uppercase tracking-tighter mb-1 block ${selectedStat?.id === stat.id ? 'text-emerald-200' : 'text-emerald-600'}`}>
                {stat.alias || 'PESQUISA'}
              </span>
              <p className="text-[10px] font-bold leading-tight line-clamp-2">{stat.nome}</p>
            </button>
          ))}
        </div>

        {selectedStat && statInsight && (
          <div className="animate-slide-up bg-emerald-900 text-white p-5 rounded-[2rem] shadow-xl">
             <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-2">Visão da IA Nacional</h5>
             <p className="text-xs leading-relaxed text-emerald-50 italic">"{statInsight}"</p>
          </div>
        )}
      </div>

      {/* Enquadramento Regulatório (CNAE) */}
      <div className="bg-indigo-50 rounded-2xl p-6 shadow-sm border border-indigo-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-black flex items-center gap-2">
            <i className="fas fa-file-contract text-indigo-600"></i> Enquadramento Regulatório (CNAE)
          </h3>
          <img src="https://upload.wikimedia.org/wikipedia/pt/2/2f/Logo_IBGE.png" className="h-6 object-contain" alt="IBGE" />
        </div>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            value={cnaeInput}
            onChange={(e) => setCnaeInput(e.target.value)}
            placeholder="Digite o código CNAE (ex: 01113)"
            className="flex-1 bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs text-black focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <button 
            onClick={handleCnaeLookup}
            disabled={loadingCnae}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 disabled:opacity-50"
          >
            {loadingCnae ? <i className="fas fa-spinner animate-spin"></i> : "Consultar"}
          </button>
        </div>

        {cnaeData && cnaeInsight && (
          <div className="animate-slide-up bg-indigo-950 text-white p-5 rounded-[2rem] shadow-lg">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Consultoria Regulatória IA</h4>
            <p className="text-xs leading-relaxed italic">"{cnaeInsight}"</p>
          </div>
        )}
      </div>

      {/* Recomendações Estratégicas */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm px-1 text-gray-800 uppercase tracking-widest">Estratégias de Exportação</h3>
        
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-2xl shadow-sm">
          <h4 className="text-sm font-bold text-emerald-900 mb-1">Dólar vs Commodities</h4>
          <p className="text-xs text-emerald-800">
            Com a alta do PIB em parceiros importadores detectada via IBGE, a demanda deve subir 5% no próximo trimestre. Considere escalonar vendas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinanceModule;
