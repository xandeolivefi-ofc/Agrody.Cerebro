
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: any) => void;
  onRegister: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de delay de rede do Firebase
    setTimeout(() => {
      const userData = {
        email: email || 'produtor@fazenda.com',
        displayName: isRegisterMode ? 'Novo Produtor' : 'Produtor Master',
        photoURL: 'https://i.pravatar.cc/150?u=agro'
      };
      
      if (isRegisterMode) onRegister(userData);
      else onLogin(userData);
      
      setLoading(false);
    }, 2000);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({
        email: 'google.user@gmail.com',
        displayName: 'João Fazendeiro',
        photoURL: 'https://i.pravatar.cc/150?u=google'
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden">
      {/* Background Proved by Unsplash - Agro Theme */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1920&q=80" 
          className="w-full h-full object-cover scale-105 brightness-50"
          alt="Field Background"
        />
        <div className="absolute inset-0 agro-gradient opacity-40"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="glass-morphism rounded-[3rem] p-8 shadow-2xl space-y-8 border border-white/20">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-xl floating">
              <i className="fas fa-brain text-4xl"></i>
            </div>
            <h1 className="text-3xl font-black text-black tracking-tighter">
              {isRegisterMode ? 'Nova Conta' : 'Cérebro Digital'}
            </h1>
            <p className="text-[10px] text-black font-black uppercase tracking-[0.2em]">Inteligência Artificial Agrícola 3.5</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-black uppercase ml-4 tracking-widest">Acesso do Operador</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600"></i>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@fazenda.com"
                  className="w-full bg-white/60 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-black placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600"></i>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha de Segurança"
                  className="w-full bg-white/60 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-black placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full agro-gradient text-white py-4 rounded-2xl font-black text-sm uppercase shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>{isRegisterMode ? 'Criar Conta e Iniciar Sinc' : 'Sincronizar Acesso'} <i className="fas fa-chevron-right text-[10px]"></i></>
              )}
            </button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:underline"
            >
              {isRegisterMode ? 'Já tenho acesso' : 'Quero cadastrar minha fazenda'}
            </button>
          </div>

          {!isRegisterMode && (
            <>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black text-black"><span className="bg-white/80 px-4 rounded-full">Ou entrar com</span></div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white/90 border border-gray-200 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-sm hover:bg-white transition-all active:scale-[0.98]"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5" alt="Google" />
                <span className="text-sm font-black text-black">Google Workspace Agro</span>
              </button>
            </>
          )}

          <p className="text-center text-[9px] text-black font-black px-4 uppercase tracking-tighter">
            Ao entrar, você aceita os termos de soberania de dados do Cérebro Digital.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
