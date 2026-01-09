
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';
import LiveBrainOverlay from './LiveBrainOverlay';

const BrainChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: 'Olá! Sou seu Cérebro Digital 3.0. Como posso ajudar com sua safra hoje? Você pode digitar ou usar o microfone para falarmos sobre manejo, mercado ou clima.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showLiveMode, setShowLiveMode] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (forcedText?: string, mode: 'chat' | 'maps' = 'chat') => {
    const textToSend = forcedText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    let responseText = "";
    
    if (mode === 'maps') {
      const mapsRes = await geminiService.searchMaps(textToSend);
      responseText = mapsRes.text;
      if (mapsRes.links.length > 0) {
        responseText += "\n\n**Fontes do Maps:**\n" + mapsRes.links.map((c: any) => `- [${c.maps?.title || 'Link'}](${c.maps?.uri})`).join('\n');
      }
    } else {
      const history = messages.slice(-5).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      responseText = await geminiService.chat(textToSend, history, isThinkingMode) || "";
    }

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setIsTyping(false);
    setMessages(prev => [...prev, modelMsg]);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            setIsTranscribing(true);
            const transcription = await geminiService.transcribeAudio(base64);
            setIsTranscribing(false);
            if (transcription) {
              setInput(transcription);
              // Feedback sonoro opcional ou animação de entrada de texto pode ser adicionada aqui
            }
          };
          // Parar todos os tracks para liberar o microfone
          stream.getTracks().forEach(track => track.stop());
        };
        
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.error("Microfone inacessível", err);
        alert("Erro ao acessar microfone. Verifique as permissões.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {showLiveMode && <LiveBrainOverlay onClose={() => setShowLiveMode(false)} />}
      
      {/* Header com Opções */}
      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isThinkingMode}
              onChange={() => setIsThinkingMode(!isThinkingMode)}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="ml-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Raciocínio Profundo</span>
          </label>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowLiveMode(true)}
            className="text-[10px] font-black text-white bg-emerald-600 px-4 py-1.5 rounded-full shadow-md flex items-center gap-2 animate-pulse hover:brightness-110 transition-all"
          >
            <i className="fas fa-bolt"></i> MODO LIVE
          </button>
          <button 
            onClick={() => handleSend(undefined, 'maps')}
            className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 flex items-center gap-2 hover:bg-blue-100 transition-all"
          >
            <i className="fas fa-location-dot"></i> MAPS
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none border border-emerald-50'
            }`}>
              <div className="prose prose-sm prose-emerald max-w-none">
                <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>
              </div>
              <span className={`text-[9px] mt-2 block font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-emerald-200' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isTranscribing && (
          <div className="flex justify-start">
            <div className="bg-blue-50 p-3 rounded-2xl rounded-tl-none flex gap-3 items-center border border-blue-100 animate-pulse">
               <i className="fas fa-wave-square text-blue-500"></i>
               <span className="text-[10px] text-blue-700 font-black uppercase tracking-widest">
                 Gemini Transcrevendo Safra...
               </span>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-emerald-50 p-4 rounded-2xl rounded-tl-none flex gap-3 items-center border border-emerald-100">
               <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
               <span className="text-[10px] text-emerald-800 font-black uppercase tracking-widest">
                 {isThinkingMode ? "O Cérebro está raciocinando..." : "Digitando..."}
               </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0 z-10">
        {isRecording && (
          <div className="mb-4 flex flex-col items-center animate-slide-up">
            <div className="flex gap-1 items-end h-8 mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <div 
                  key={i} 
                  className="w-1 bg-red-500 rounded-full animate-pulse" 
                  style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }}
                ></div>
              ))}
            </div>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">Gravando Comando de Voz...</span>
          </div>
        )}

        <div className="flex items-center gap-3 bg-gray-50 rounded-3xl px-4 py-2 border border-gray-200 shadow-inner">
          <button 
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse scale-110' 
                : 'bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-100'
            }`}
            title={isRecording ? "Parar Gravação" : "Falar com o Cérebro"}
          >
            <i className={`fas ${isRecording ? 'fa-square' : 'fa-microphone'} text-lg`}></i>
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isTranscribing ? "Aguarde a transcrição..." : "Fale ou digite sobre sua fazenda..."}
            disabled={isTranscribing}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 font-medium placeholder:text-gray-400"
          />
          
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping || isTranscribing}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              input.trim() && !isTyping && !isTranscribing
                ? 'bg-emerald-600 text-white shadow-lg active:scale-95' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BrainChat;
