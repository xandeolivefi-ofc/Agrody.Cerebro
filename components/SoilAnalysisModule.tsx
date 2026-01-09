
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { SoilNutrients, FertilizationPrescription } from '../types';

const SoilAnalysisModule: React.FC = () => {
  const [nutrients, setNutrients] = useState<SoilNutrients>({
    ph: 5.4,
    mo: 2.8,
    p: 8.5,
    k: 0.15,
    ctc: 12.4,
    v_percent: 42
  });
  const [targetYield, setTargetYield] = useState(75);
  const [loading, setLoading] = useState(false);
  const [prescription, setPrescription] = useState<FertilizationPrescription | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    const res = await geminiService.generateSoilPrescription(nutrients, targetYield);
    setPrescription(res);
    setLoading(false);
  };

  const NutrientInput = ({ label, value, field, unit, min, max, step }: any) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
        <span>{label}</span>
        <span className="text-emerald-600">{value} {unit}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value}
        onChange={(e) => setNutrients({ ...nutrients, [field]: parseFloat(e.target.value) })}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
      />
    </div>
  );

  return (
    <div className="p-4 space-y-6 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-emerald-950">Laboratório de Solo</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Análise Química • Prescrição Neural</p>
        </div>
        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
          <i className="fas fa-flask-vial text-xl"></i>
        </div>
      </div>

      {/* Soil Data Input */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-50 space-y-5">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Simulação de Laudo</h3>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <NutrientInput label="pH (CaCl2)" value={nutrients.ph} field="ph" unit="" min={4} max={7} step={0.1} />
          <NutrientInput label="M.O." value={nutrients.mo} field="mo" unit="%" min={0} max={6} step={0.1} />
          <NutrientInput label="P (Fósforo)" value={nutrients.p} field="p" unit="mg/dm3" min={0} max={40} step={0.5} />
          <NutrientInput label="K (Potássio)" value={nutrients.k} field="k" unit="cmolc" min={0} max={1} step={0.01} />
          <NutrientInput label="CTC Total" value={nutrients.ctc} field="ctc" unit="" min={5} max={25} step={0.5} />
          <NutrientInput label="V% (Bases)" value={nutrients.v_percent} field="v_percent" unit="%" min={10} max={90} step={1} />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-black text-gray-700 uppercase">Alvo de Produtividade (sc/ha)</label>
            <span className="text-emerald-700 font-black">{targetYield} sc</span>
          </div>
          <input 
            type="range" min="40" max="110" step="1" value={targetYield}
            onChange={(e) => setTargetYield(parseInt(e.target.value))}
            className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-white bg-emerald-600 shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <i className="fas fa-microchip"></i>
              <span>Gerar Prescrição Inteligente</span>
            </>
          )}
        </button>
      </div>

      {prescription && (
        <div className="animate-slide-up space-y-6">
          {/* Status Overview */}
          <div className={`rounded-3xl p-6 shadow-xl text-white ${
            prescription.soilStatus === 'pobre' ? 'bg-red-500' : 
            prescription.soilStatus === 'medio' ? 'bg-amber-500' : 'bg-emerald-600'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Status de Fertilidade</span>
                <h3 className="text-2xl font-black uppercase">{prescription.soilStatus}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                 <span className="text-xs font-black">+ {prescription.expectedYieldIncrease}%</span>
                 <p className="text-[8px] uppercase font-bold opacity-80">Potencial Gain</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase opacity-70">Limitações Detectadas:</p>
              <div className="flex flex-wrap gap-2">
                {prescription.limitations.map((l, i) => (
                  <span key={i} className="bg-black/10 px-3 py-1 rounded-full text-[10px] font-bold border border-white/20">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Prescription Plan */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Cronograma de Fertilização</h3>
            {prescription.plan.map((step, i) => (
              <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex gap-4">
                <div className="flex flex-col items-center gap-1 w-12 flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                    {i + 1}
                  </div>
                  <div className="w-0.5 flex-1 bg-emerald-100 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                        {step.timing}
                      </span>
                      <h4 className="text-sm font-black text-gray-800 mt-1">{step.product}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-700">{step.dosage}</span>
                      <span className="text-[9px] text-gray-400 font-bold ml-1 uppercase">{step.unit}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-tight italic">
                    "{step.rationale}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
             <i className="fas fa-triangle-exclamation text-amber-500 mt-1"></i>
             <p className="text-[10px] text-amber-800 leading-tight">
               Esta prescrição é gerada por inteligência artificial para fins de simulação técnica. Consulte sempre um Engenheiro Agrônomo responsável antes da aplicação real no campo.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilAnalysisModule;
