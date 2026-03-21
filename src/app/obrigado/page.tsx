"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bungee, Changa_One } from "next/font/google";

const bungee = Bungee({ weight: "400", subsets: ["latin"] });
const changaOne = Changa_One({ weight: "400", subsets: ["latin"] });

export default function ObrigadoPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
      
      {/* CONTAINER */}
      <div className="bg-[#1E293B] p-10 md:p-16 rounded-[3rem] border border-[#334155] shadow-2xl max-w-2xl w-full space-y-8">

        {/* ÍCONE */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-green-500/20 blur-3xl animate-pulse"></div>

          <div className="relative w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/40">
            <svg 
              className="w-12 h-12 text-green-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="3" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* TEXTO */}
        <div className="space-y-4">
          <h1 className={`${bungee.className} text-4xl md:text-5xl text-green-400`}>
            Voto Registrado!
          </h1>

          <p className={`${changaOne.className} text-gray-400 text-lg md:text-xl`}>
            Obrigado por participar das eleições do <br />
            <span className="text-white">Grêmio Estudantil 2026.</span>
          </p>
        </div>

        {/* AVISO */}
        <div className="bg-[#020617] py-3 px-6 rounded-2xl border border-[#334155] inline-block text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Sua sessão foi encerrada por segurança
        </div>

        {/* BOTÃO */}
        <div className="pt-6">
          <button
            onClick={() => router.push("/")}
            className="w-full md:w-auto px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95"
          >
            Voltar ao Início
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 space-y-2 opacity-40">
        <p className="text-[10px] uppercase tracking-widest text-gray-500">
          Sistema de Votação Digital
        </p>
        <p className="text-[9px] text-gray-600">
          A democracia é construída por todos nós.
        </p>
      </footer>
    </div>
  );
}