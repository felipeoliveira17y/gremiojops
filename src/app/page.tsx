"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bungee, Changa_One } from "next/font/google"; // Importação otimizada
import { supabase } from "@/lib/supabase";

// Configuração das fontes via Google Fonts
const bungee = Bungee({ 
  weight: "400", 
  subsets: ["latin"],
  display: "swap" 
});

const changaOne = Changa_One({ 
  weight: "400", 
  subsets: ["latin"],
  display: "swap" 
});

export default function Home() {
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Máscara de Data de Nascimento (DD/MM/AAAA)
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 2) {
      value = value;
    } else if (value.length <= 4) {
      value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    } else {
      value = value.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
    }
    setPassword(value.slice(0, 10));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!matricula || password.length < 10) {
      alert("Preencha a matrícula e a data de nascimento completa.");
      setLoading(false);
      return;
    }

    // Conversão para o padrão do Banco (AAAA-MM-DD)
    const [dia, mes, ano] = password.split("/");
    const dataFormatadaUSA = `${ano}-${mes}-${dia}`;

    try {
      // 1. TENTATIVA: ALUNOS
      const { data: aluno } = await supabase
        .from("alunos")
        .select("*")
        .eq("matricula", matricula)
        .maybeSingle();

      if (aluno) {
        if (aluno.data_nascimento === dataFormatadaUSA) {
          // Salva sessão do aluno
          localStorage.setItem("aluno_sessao", JSON.stringify(aluno));
          router.push("/votacao");
          return;
        } else {
          alert("Data de nascimento incorreta!");
          setLoading(false);
          return;
        }
      }

      // 2. TENTATIVA: PROFESSORES / ADM
      const { data: professor } = await supabase
        .from("professores")
        .select("*")
        .eq("matricula", matricula)
        .maybeSingle();

      if (professor) {
        if (professor.data_nascimento === dataFormatadaUSA) {
          // Criamos o objeto de sessão com a chave e o role que o ADM espera
          const sessaoAdmin = {
            ...professor,
            role: "adm" // Garante que a página /adm aceite o login
          };
          
          localStorage.setItem("user_session", JSON.stringify(sessaoAdmin));
          router.push("/adm");
          return;
        } else {
          alert("Senha de professor incorreta!");
          setLoading(false);
          return;
        }
      }

      alert("Matrícula não encontrada.");
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o banco.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black text-white flex flex-col items-center justify-center p-6">
      
      {/* Cabeçalho com animação suave */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
        <h1 className={`${bungee.className} text-4xl md:text-6xl bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent drop-shadow-sm`}>
          VOTE NO FUTURO
        </h1>
        <p className={`${changaOne.className} text-gray-400 mt-3 tracking-widest uppercase text-sm md:text-base`}>
          Portal de Eleições • Grêmio Estudantil
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl">
        
        {/* Lado Esquerdo: Formulário */}
        <div className="space-y-8">
          <div>
            <h2 className={`${bungee.className} text-2xl text-white`}>Acesso</h2>
            <p className="text-gray-400 text-sm">Insira seus dados para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-tighter text-blue-400 ml-1">Matrícula</label>
              <input
                type="text"
                placeholder="Número da matrícula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full p-4 rounded-2xl bg-black/50 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-tighter text-purple-400 ml-1">Data de Nascimento</label>
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-4 rounded-2xl bg-black/50 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-white text-black hover:bg-blue-400 hover:text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
            >
              {loading ? "Verificando..." : "Entrar no Sistema"}
            </button>
          </form>
        </div>

        {/* Lado Direito: Visual */}
        <div className="hidden md:flex flex-col items-center justify-center p-6 border-l border-white/5">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-[300px] h-[300px]">
              <Image
                src="/acesso.jpeg"
                alt="Grêmio Estudantil"
                fill
                className="rounded-2xl shadow-2xl hover:grayscale-0 transition-all duration-500 object-cover"
                priority
              />
            </div>
          </div>
          <p className={`${changaOne.className} text-gray-500 mt-8 text-center text-sm leading-relaxed`}>
            "A democracia na escola começa <br/> com a sua participação."
          </p>
        </div>
      </div>

      <footer className="mt-12 text-gray-600 text-[10px] uppercase tracking-[0.2em]">
        © 2026 • Developed with the intention of gaining experience.
      </footer>
    </div>
  );
}