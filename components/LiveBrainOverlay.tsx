
import React, { useEffect, useRef, useState } from 'react';
import { geminiService } from '../services/geminiService';

interface LiveBrainOverlayProps {
  onClose: () => void;
}

const LiveBrainOverlay: React.FC<LiveBrainOverlayProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'listening' | 'speaking'>('connecting');
  const [interrupted, setInterrupted] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const outCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionPromiseRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    // Inicializar contextos de áudio
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    const startSession = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        sessionPromiseRef.current = geminiService.connectLive({
          onopen: () => {
            setStatus('listening');
            const source = audioCtxRef.current!.createMediaStreamSource(stream);
            const processor = audioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const encoded = geminiService.encodeAudio(inputData);
              sessionPromiseRef.current.then((session: any) => {
                session.sendRealtimeInput({ media: { data: encoded, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            
            source.connect(processor);
            processor.connect(audioCtxRef.current!.destination);
          },
          onmessage: async (message: any) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setStatus('speaking');
              const buffer = await geminiService.decodeAudio(audioData);
              const audioBuffer = await geminiService.createAudioBuffer(buffer, outCtxRef.current!, 24000);
              
              const source = outCtxRef.current!.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtxRef.current!.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtxRef.current!.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              };
            }

            if (message.serverContent?.interrupted) {
              setInterrupted(true);
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => console.error("Live Error:", e),
          onclose: () => onClose(),
        });
      } catch (err) {
        console.error("Camera/Mic Error:", err);
        onClose();
      }
    };

    startSession();

    return () => {
      audioCtxRef.current?.close();
      outCtxRef.current?.close();
      sessionPromiseRef.current?.then((s: any) => s.close());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-emerald-950/95 backdrop-blur-2xl flex flex-col items-center justify-center text-white p-8">
      <div className="absolute top-8 right-8">
        <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        {/* Camadas de ondas neurais */}
        <div className={`absolute w-64 h-64 rounded-full bg-emerald-500/20 animate-ping ${status === 'speaking' ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className={`absolute w-48 h-48 rounded-full bg-emerald-400/30 animate-pulse ${status !== 'connecting' ? 'opacity-100' : 'opacity-0'}`}></div>
        
        <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]">
          <i className={`fas fa-brain text-4xl ${status === 'speaking' ? 'text-emerald-600' : 'text-gray-400'} transition-colors duration-500`}></i>
        </div>
      </div>

      <div className="mt-12 text-center space-y-4">
        <h2 className="text-2xl font-black tracking-tight">
          {status === 'connecting' ? 'Sincronizando...' : status === 'speaking' ? 'Cérebro Digital falando...' : 'Ouvindo você...'}
        </h2>
        <p className="text-emerald-300/60 text-sm font-medium max-w-xs mx-auto">
          {status === 'listening' ? 'Pode falar sobre manejo, clima ou mercado. Eu entendo o contexto da sua fazenda.' : 'A conexão está ativa e segura.'}
        </p>
      </div>

      <div className="absolute bottom-12 flex gap-4">
        <div className="flex gap-1 items-end h-8">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className={`w-1 bg-emerald-400 rounded-full transition-all duration-150 ${status === 'speaking' ? 'h-full animate-bounce' : 'h-1'}`} style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveBrainOverlay;
