import React from 'react';
import { ArrowLeft, Share2, Scale, Percent, Camera } from 'lucide-react';

export function AthleteEvolution({ onNavigate, studentId }: { onNavigate: (screen: string, studentId?: string) => void, studentId?: string | null }) {
  return (
    <div className="flex-1 pb-24 md:pb-8 overflow-y-auto bg-[#0b1117]">
      <header className="sticky top-0 z-10 bg-[#101922] border-b border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center justify-center p-1 rounded-lg hover:bg-slate-800">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </button>
          <h1 className="text-lg font-bold text-slate-100">Evolução de Atleta</h1>
        </div>
        <button className="flex items-center justify-center p-1 rounded-lg hover:bg-slate-800">
          <Share2 className="w-5 h-5 text-slate-400" />
        </button>
      </header>

      <div className="px-4 md:px-8 py-3 flex items-center gap-4 max-w-4xl mx-auto w-full">
        <div className="w-12 h-12 rounded-full bg-[#137fec]/20 flex items-center justify-center border border-[#137fec]/30 overflow-hidden">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcneVKqWospPfkB0643FXpmb14ZpzbUOKyqDFCvuj34BAkm2sS5LvO51DANxphLFC87M8HOQGeMurZuEwkRovlPUwtRgGP6SKJZMC8SJG09TRCdatOO90q9IPSWCHlZD55v6Uns5I9ctqnjaaocmZr4cVBbaJ0-vDpFbsgAyRSBCSJ-6Ta3QXd49yMtJ1tEj6D5ApNi5FiyXrFgkzP24I68_YCt3E1Q3ZeSi4LEejzVCYl43ytQe8D4-xClyjmlCb70GAGquYh0ko" alt="Profile" className="object-cover w-full h-full" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-100">Lucas Silva</h2>
          <p className="text-xs text-slate-400">Plano de Hipertrofia Masculina</p>
        </div>
      </div>

      <nav className="px-4 md:px-8 border-b border-slate-800">
        <div className="flex gap-6 overflow-x-auto no-scrollbar max-w-4xl mx-auto w-full">
          <button className="border-b-2 border-[#137fec] py-3 text-sm font-bold text-[#137fec]">Frontal</button>
          <button className="border-b-2 border-transparent py-3 text-sm font-medium text-slate-400">Lateral</button>
          <button className="border-b-2 border-transparent py-3 text-sm font-medium text-slate-400">Costas</button>
        </div>
      </nav>

      <main className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="relative group">
              <div className="absolute top-2 left-2 bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10">Anterior</div>
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3tyfGN5Uc1xuHIuyMjnDfvR4XrSwQxASGNWPc-UeEtSVGeLFIMjZneL2wcDku4o5vCmjbWPOS0uEpL1IVnI9wFkbDPgiISLE_mnRkjGgxe-piUzt50EncOsh-mmKqqluuYX_4rN0D58fd__iJOueybw2pBz2MjHWzhAIjYc1h77FncAVqqY4R5LrKbxdlMhY4HYQ4VQZ9bUztAGiAI0XaqqHVmHC8w31eLZ_qWFaR1x_n44k1-bMqz5EXqpP2yUGbfqoNaag3Nx0" alt="Before" className="object-cover w-full h-full" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-100">15 Jan 2024</p>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-slate-400 flex items-center gap-1"><Scale className="w-3 h-3" /> 82.5 kg</span>
                <span className="text-xs text-slate-400 flex items-center gap-1"><Percent className="w-3 h-3" /> 18.2% BF</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative group">
              <div className="absolute top-2 left-2 bg-[#137fec] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10">Atual</div>
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-800 border border-[#137fec]/50 ring-2 ring-[#137fec]/20">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_dekaP7xbEiOZLMPwW7fnJGeb4IlieZ_EyeF98oFKFpH6tuvrCG91lKLIyPtIVv5-aXpHcStoT5VknUqsgj5uAueZtJPTPVYZ1aGJ-CUtTang_1k_Asmrev5YzlgQa6CzNrIVXZ1XGj5h1CjpM1fNWpCLMCZp5wzS2vmpqOFTZLQ7DbPiUtcBJZpehJkDcLajXu66pWFk7kZstivvGwrCU6ARC192V0E8UYLmzfpZEXztuJuy3zX4MES2FHTTXzOQqKBgFI56OxY" alt="After" className="object-cover w-full h-full" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#137fec]">22 Mar 2024</p>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-slate-100 flex items-center gap-1"><Scale className="w-3 h-3 text-[#137fec]" /> 77.8 kg</span>
                <span className="text-sm font-semibold text-slate-100 flex items-center gap-1"><Percent className="w-3 h-3 text-[#137fec]" /> 14.5% BF</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#137fec]/10 border border-[#137fec]/20 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#137fec] mb-3">Resumo de Progresso</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 mb-1">Peso</p>
              <p className="text-lg font-bold text-emerald-500">-4.7 kg</p>
            </div>
            <div className="text-center border-x border-slate-800">
              <p className="text-[10px] text-slate-400 mb-1">Gordura</p>
              <p className="text-lg font-bold text-emerald-500">-3.7%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 mb-1">Duração</p>
              <p className="text-lg font-bold text-slate-100">67 dias</p>
            </div>
          </div>
        </div>

        <button className="w-full bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#137fec]/20">
          <Camera className="w-5 h-5" /> Enviar Novas Fotos
        </button>
      </main>
    </div>
  );
}
