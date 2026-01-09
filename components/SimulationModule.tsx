
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { MOCK_FARM } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const SimulationModule: React.FC = () => {
  const [dosage, setDosage] = useState(250);
  const [fertType, setFertType] = useState('NPK 04-14-08');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<{
    healthScoreDelta: number;
    yieldDelta: number;
    technicalReasoning: string;
  } | null>(null);

  const [currentMetrics, setCurrentMetrics] = useState({
    health: MOCK_FARM.healthScore,
    yield: 62 // Base yield sacos/ha
  });

  const runSimulation = async () => {
    setIsSimulating(true);
    const prediction = await geminiService.predictFertilizationImpact(fertType, dosage);
    if (prediction) {
      setResult(prediction);
      setCurrentMetrics({
        health: Math.min(100, Math.max(0, MOCK_FARM.healthScore + prediction.healthScoreDelta)),
        yield: Math.max(40, 62 + prediction.yieldDelta)
      });
    }
    setIsSimulating(false);
  };

  const healthData = [
    { name: 'Health', value: currentMetrics.health },
    { name: 'Remain', value: 100 - currentMetrics.health },
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-gray-800">Simulador de Safra</h2>
        <p className="text-xs text-gray-500">Ajuste os parâmetros para prever o impacto na colheita.</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-gray-700">Tipo de Fertilizante</label>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Fertirrigação</span>
          </div>
          <select 
            value={fertType}
            onChange={(e) => setFertType(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option>NPK 04-14-08</option>
            <option>NPK 20-00-20</option>
            <option>Ureia Agrícola</option>
            <option>Calcário Dolomítico</option>
            <option>Orgânico Composto</option>
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-gray-700">Dosagem (kg/ha)</label>
            <span className="text-emerald-600 font-black">{dosage} kg</span>
          </div>
          <input 
            type="range" 
            min="50" 
            max="800" 
            step="10"
            value={dosage}
            onChange={(e) => setDosage(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
            <span>Baixa</span>
            <span>Média</span>
            <span>Alta</span>
          </div>
        </div>

        <button 
          onClick={runSimulation}
          disabled={isSimulating}
          className={`w-full agro-gradient text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isSimulating ? 'opacity-70' : ''}`}
        >
          {isSimulating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processando...</span>
            </>
          ) : (
            <>
              <i className="fas fa-microchip"></i>
              <span>Consultar IA do Cérebro</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Results */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">Saúde do Solo</span>
          <div className="h-24 w-24 relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={healthData}
                   cx="50%"
                   cy="50%"
                   innerRadius={30}
                   outerRadius={40}
                   startAngle={90}
                   endAngle={-270}
                   paddingAngle={0}
                   dataKey="value"
                 >
                   <Cell fill="#10b981" />
                   <Cell fill="#f3f4f6" />
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center flex-col">
               <span className="text-xl font-black text-emerald-800">{currentMetrics.health}%</span>
             </div>
          </div>
          {result && (
            <span className={`text-[10px] font-bold mt-2 ${result.healthScoreDelta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {result.healthScoreDelta >= 0 ? '+' : ''}{result.healthScoreDelta} pts
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">Produtividade Est.</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-emerald-900">{currentMetrics.yield}</span>
            <span className="text-xs text-gray-500 font-bold">sc/ha</span>
          </div>
          {result && (
            <span className={`text-[10px] font-bold mt-2 ${result.yieldDelta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {result.yieldDelta >= 0 ? '+' : ''}{result.yieldDelta} sc/ha
            </span>
          )}
        </div>
      </div>

      {/* AI Reasoning */}
      {result && (
        <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-xl animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <i className="fas fa-brain text-emerald-400"></i>
            <h4 className="text-sm font-bold">Análise do Cérebro Digital</h4>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed italic">
            "{result.technicalReasoning}"
          </p>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Custo de Aplicação</span>
            <span className="text-sm font-bold">R$ {(dosage * 4.2).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      )}

      {/* Info Card */}
      {!result && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start">
          <div className="text-blue-500 mt-1">
            <i className="fas fa-info-circle"></i>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-blue-900">Como funciona?</h4>
            <p className="text-[10px] text-blue-700 leading-tight">
              A IA cruza dados de solo latossolo (Rio Verde) com as necessidades da soja e as condições climáticas atuais para prever o aproveitamento nutricional.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationModule;
