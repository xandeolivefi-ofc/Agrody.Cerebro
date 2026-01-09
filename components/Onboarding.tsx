
import React, { useState, useRef } from 'react';
import { FarmData } from '../types';
import { geminiService } from '../services/geminiService';

interface OnboardingProps {
  onComplete: (data: Partial<FarmData>) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const finishOnboarding = async () => {
    setLoading(true);
    // Simulação de sincronização de satélite com IA
    await new Promise(r => setTimeout(r, 3000));
    
    onComplete({
      name: farmName,
      location: location,
      area: parseFloat(area),
      healthScore: 85, // Score inicial padrão
      lastAnalysis: new Date().toLocaleDateString('pt-BR'),
      referenceImages: image ? [image] : []
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 agro-gradient"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 transition-all rounded-full ${step === i ? 'w-8 bg-emerald-600' : 'w-2 bg-gray-300'}`}></div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto">
                <i className="fas fa-tractor text-2xl"></i>
              </div>
              <h2 className="text-2xl font-black text-black tracking-tighter">Identidade da Unidade</h2>
              <p className="text-xs text-black font-bold">Como devemos chamar sua fazenda no sistema?</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-black uppercase ml-4 tracking-widest">Nome da Propriedade</label>
                <input 
                  type="text" 
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="Ex: Fazenda Boa Esperança"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-sm font-black text-black focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-black uppercase ml-4 tracking-widest">Área Total (Hectares)</label>
                <input 
                  type="number" 
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Ex: 450"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-sm font-black text-black focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-gray-400"
                />
              </div>
              <button 
                onClick={handleNext}
                disabled={!farmName || !area}
                className="w-full agro-gradient text-white py-4 rounded-2xl font-black text-sm uppercase shadow-lg disabled:opacity-50 transition-all active:scale-95"
              >
                Próximo Passo <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto">
                <i className="fas fa-location-dot text-2xl"></i>
              </div>
              <h2 className="text-2xl font-black text-black tracking-tighter">Ancoragem de Satélite</h2>
              <p className="text-xs text-black font-bold">Onde sua fazenda está localizada?</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-black uppercase ml-4 tracking-widest">Cidade e Estado (UF)</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Rio Verde, GO"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-sm font-black text-black focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-center">
                <i className="fas fa-satellite text-blue-500 animate-pulse"></i>
                <p className="text-[9px] text-black font-black leading-tight uppercase tracking-tighter">
                  Usaremos estas coordenadas para baixar dados do Sentinel-2 e prever o microclima exato do seu talhão.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 bg-gray-100 text-black py-4 rounded-2xl font-black text-sm uppercase active:scale-95 border border-gray-200">Voltar</button>
                <button 
                  onClick={handleNext}
                  disabled={!location}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase shadow-lg disabled:opacity-50 active:scale-95"
                >
                  Continuar <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in text-center">
            {loading ? (
              <div className="space-y-6 py-10">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-satellite-dish text-3xl text-emerald-500 animate-pulse"></i>
                  </div>
                </div>
                <h2 className="text-xl font-black text-black">Sincronizando Satélites</h2>
                <p className="text-xs text-black font-black uppercase tracking-widest animate-pulse">Mapeando Toponímia e Clima...</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mx-auto">
                    <i className="fas fa-images text-2xl"></i>
                  </div>
                  <h2 className="text-2xl font-black text-black tracking-tighter">Digital Twin</h2>
                  <p className="text-xs text-black font-bold">Envie fotos da área para o Google processar as camadas de satélite.</p>
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden relative"
                >
                  {image ? (
                    <img src={image} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <i className="fas fa-cloud-arrow-up text-3xl text-gray-300 mb-2"></i>
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">Fotos de Drone ou Satélite</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 bg-gray-100 text-black py-4 rounded-2xl font-black text-sm uppercase active:scale-95 border border-gray-200">Voltar</button>
                  <button 
                    onClick={finishOnboarding}
                    className="flex-[2] agro-gradient text-white py-4 rounded-2xl font-black text-sm uppercase shadow-lg active:scale-95"
                  >
                    Ativar Cérebro <i className="fas fa-bolt ml-2"></i>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
