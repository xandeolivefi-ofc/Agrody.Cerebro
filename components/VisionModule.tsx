
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

interface VisionResult {
  title: string;
  description: string;
  severity: number;
  tags: string[];
  detections?: { label: string; location: string }[];
}

const VisionModule: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<VisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State para Geração de Imagem (IA Generativa)
  const [genPrompt, setGenPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);

  const ratios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setImage(reader.result as string);
        setIsCameraActive(false);
        runDeepDiagnostic(base64);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const startCamera = async () => {
    setImage(null);
    setResult(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setIsCameraActive(false);
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
        runDeepDiagnostic(dataUrl.split(',')[1]);
      }
    }
  };

  const runDeepDiagnostic = async (base64: string) => {
    setLoading(true);
    setResult(null);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(p => (p < 95 ? p + 5 : p));
    }, 100);

    const diagnostic = await geminiService.analyzeAgroImage(base64, 'diagnostic');
    
    clearInterval(interval);
    setScanProgress(100);
    setResult(diagnostic);
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!genPrompt.trim()) return;
    setGenLoading(true);
    setGeneratedImg(null);
    const res = await geminiService.generateImage(genPrompt, aspectRatio);
    setGeneratedImg(res);
    setGenLoading(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="p-4 space-y-6 pb-24">
      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload} 
      />
      
      {/* Diagnóstico Digital Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-black text-emerald-900">Laboratório Digital</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Detecção Proativa • Vision Pro</p>
          </div>
          <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
            <i className="fas fa-microscope text-xl"></i>
          </div>
        </div>

        <div className="relative group rounded-[2.5rem] overflow-hidden bg-gray-900 aspect-square shadow-2xl border-4 border-white">
          {isCameraActive ? (
            <div className="relative w-full h-full">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-[40px] border-black/40"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-emerald-400/50 rounded-2xl"></div>
                <div className="absolute top-0 w-full h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-scan"></div>
              </div>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6">
                <button 
                  onClick={stopCamera}
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center"
                >
                  <i className="fas fa-times"></i>
                </button>
                <button 
                  onClick={takeSnapshot}
                  className="w-16 h-16 rounded-full bg-emerald-500 text-white shadow-xl border-4 border-white flex items-center justify-center active:scale-90 transition-transform"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-white/50"></div>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center"
                >
                  <i className="fas fa-upload"></i>
                </button>
              </div>
            </div>
          ) : image ? (
            <>
              <img src={image} className="w-full h-full object-cover opacity-80" alt="Campo" />
              {loading && (
                <div className="absolute inset-0 z-10">
                   <div className="absolute w-full h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-scan"></div>
                   <div className="absolute inset-0 bg-emerald-900/20 backdrop-blur-[1px]"></div>
                   <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center">
                     <span className="text-white font-black text-2xl tracking-tighter animate-pulse">{scanProgress}%</span>
                     <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Analisando fitopatologia...</span>
                   </div>
                </div>
              )}
              {!loading && result?.detections?.map((d, i) => (
                <div key={i} className="absolute flex items-center gap-2 bg-emerald-500/90 text-white text-[10px] px-2 py-1 rounded-full shadow-lg border border-white/50 backdrop-blur-sm animate-bounce" style={{
                  top: d.location.includes('superior') ? '20%' : d.location.includes('inferior') ? '70%' : '50%',
                  left: d.location.includes('esquerdo') ? '20%' : d.location.includes('direito') ? '70%' : '50%'
                }}>
                  <i className="fas fa-crosshairs"></i> {d.label}
                </div>
              ))}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
              {/* Botão de Câmera */}
              <button 
                onClick={startCamera}
                className="w-full h-2/5 flex flex-col items-center justify-center transition-all border-2 border-dashed border-emerald-500/30 rounded-[2rem] bg-emerald-900/10 hover:bg-emerald-900/20 active:scale-[0.98]"
              >
                <i className="fas fa-camera text-4xl text-emerald-500 mb-2"></i>
                <p className="text-emerald-500 font-bold text-sm uppercase tracking-tight">Câmera em Tempo Real</p>
                <p className="text-gray-600 text-[8px] uppercase tracking-widest mt-1">Diagnóstico In Loco</p>
              </button>
              
              <div className="w-full h-px bg-gray-800/50 flex items-center justify-center">
                <span className="bg-gray-900 px-4 text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Sincronização de Dados</span>
              </div>

              {/* NOVO: Botão de Upload Centralizado e Prominente */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-2/5 flex flex-col items-center justify-center transition-all border-2 border-dashed border-blue-500/30 rounded-[2rem] bg-blue-900/10 hover:bg-blue-900/20 active:scale-[0.98]"
              >
                <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl mb-3">
                  <i className="fas fa-file-arrow-up text-2xl"></i>
                </div>
                <p className="text-blue-400 font-bold text-sm uppercase tracking-tight">Upload de Arquivo</p>
                <p className="text-gray-600 text-[8px] uppercase tracking-widest mt-1">Imagens de Drone, Sensor ou Celular</p>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons when image exists */}
        {image && !loading && (
          <div className="flex gap-2 animate-slide-up">
            <button 
              onClick={startCamera}
              className="flex-1 bg-white border border-gray-200 py-4 rounded-2xl text-[10px] font-black uppercase text-gray-700 shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <i className="fas fa-camera"></i> Câmera
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-white border border-gray-200 py-4 rounded-2xl text-[10px] font-black uppercase text-gray-700 shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <i className="fas fa-upload"></i> Novo Arquivo
            </button>
            <button 
              onClick={() => image && runDeepDiagnostic(image.split(',')[1])}
              className="flex-1 agro-gradient text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <i className="fas fa-microchip"></i> Re-Analisar
            </button>
          </div>
        )}

        {/* Results Card */}
        {result && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-50 animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-black text-xl text-gray-800 leading-none">{result.title}</h3>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black ${
                result.severity > 70 ? 'bg-red-100 text-red-600' : 
                result.severity > 40 ? 'bg-amber-100 text-amber-600' : 
                'bg-emerald-100 text-emerald-600'
              }`}>
                URGÊNCIA: {result.severity}%
              </div>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{result.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {result.tags.map((t, i) => (
                <span key={i} className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                  #{t}
                </span>
              ))}
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-4">
              <div className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-check text-xs"></i>
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-900 mb-1 uppercase tracking-wider">Protocolo Sugerido</h4>
                <p className="text-[10px] text-emerald-800 leading-tight font-medium">
                  Análise baseada em banco de dados fitossanitários mundiais. Recomenda-se calibração de pulverizadores para a área afetada.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* IA Generativa Section */}
      <section className="pt-4 border-t border-gray-200 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-black text-purple-900">Estúdio de Conceitos</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Gerador de Imagens Pro</p>
          </div>
          <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
            <i className="fas fa-wand-magic-sparkles text-xl"></i>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-purple-50 space-y-4">
          <textarea 
            value={genPrompt}
            onChange={(e) => setGenPrompt(e.target.value)}
            placeholder="Descreva o cenário: Ex. Soja em estágio R3 sob pivô central ao pôr do sol, estilo fotográfico..."
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm border-none focus:ring-2 focus:ring-purple-400 min-h-[100px] outline-none"
          />

          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase ml-1">Aspect Ratio</p>
            <div className="flex flex-wrap gap-2">
              {ratios.map(r => (
                <button 
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${
                    aspectRatio === r ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={genLoading || !genPrompt}
            className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {genLoading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <><i className="fas fa-bolt"></i> Gerar Visual 1K</>}
          </button>
        </div>

        {generatedImg && (
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white animate-fade-in group relative">
             <img src={generatedImg} className="w-full h-auto" alt="AI Generated" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/30">
                  <i className="fas fa-download mr-2"></i> Salvar Conceito
                </button>
             </div>
          </div>
        )}
      </section>

      <style>{`
        @keyframes scan {
          from { top: 0; }
          to { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VisionModule;
