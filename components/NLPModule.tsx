
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { NLPAnalysis } from '../types';

const NLPModule: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NLPAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const analysis = await geminiService.analyzeTextLinguistics(text);
    setResult(analysis);
    setLoading(false);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positivo': return 'fa-face-smile text-green-500';
      case 'negativo': return 'fa-face-frown text-red-500';
      case 'urgente': return 'fa-triangle-exclamation text-amber-500';
      default: return 'fa-face-meh text-gray-400';
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-indigo-950">Analista Linguístico</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Natural Language API • Insights de Texto</p>
        </div>
        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
          <i className="fas fa-spell-check text-xl"></i>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-50 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole aqui relatórios de consultoria, notas de campo ou transcrições de áudios técnicos para análise profunda..."
          className="w-full bg-gray-50 rounded-2xl p-4 text-sm border-none focus:ring-2 focus:ring-indigo-400 min-h-[160px] outline-none"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className="w-full py-4 rounded-2xl font-black text-white bg-indigo-600 shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <i className="fas fa-microchip"></i>
              <span>Extrair Insights NLP</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="animate-slide-up space-y-6">
          {/* Sentiment Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center gap-6">
            <div className="flex flex-col items-center">
              <i className={`fas ${getSentimentIcon(result.sentiment)} text-5xl`}></i>
              <span className="text-[10px] font-black uppercase mt-2 text-gray-500">{result.sentiment}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-gray-400">Score de Confiança</span>
                <span className="text-sm font-black text-indigo-600">{(result.score * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000" 
                  style={{ width: `${result.score * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Entities Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Entidades Identificadas</h3>
            <div className="grid grid-cols-2 gap-3">
              {result.entities.map((ent, i) => (
                <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                      {ent.type}
                    </span>
                    <div className="flex gap-0.5">
                      {[1,2,3].map(s => (
                        <div key={s} className={`w-1 h-1 rounded-full ${s <= ent.importance ? 'bg-amber-400' : 'bg-gray-200'}`}></div>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-800 mt-2">{ent.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-indigo-950 text-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-sm font-black mb-4 flex items-center gap-2">
              <i className="fas fa-list-check text-indigo-400"></i> Plano de Ação Recomendado
            </h3>
            <ul className="space-y-3">
              {result.actionItems.map((item, i) => (
                <li key={i} className="flex gap-3 text-xs text-indigo-100 leading-tight">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                    {i + 1}
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NLPModule;
