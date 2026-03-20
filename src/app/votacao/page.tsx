"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bungee, Changa_One } from "next/font/google";
import { supabase } from "@/lib/supabase";

const bungee = Bungee({ weight: "400", subsets: ["latin"] });
const changaOne = Changa_One({ weight: "400", subsets: ["latin"] });

export default function VotacaoPage() {
  const [alunoDados, setAlunoDados] = useState<any>(null);
  const [modalInfo, setModalInfo] = useState<{aberto: boolean, chapa: number | null}>({
    aberto: false,
    chapa: null
  });
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sessao = localStorage.getItem("aluno_sessao");
    if (!sessao) {
      router.push("/");
      return;
    }
    const dados = JSON.parse(sessao);
    if (dados.cargo || !dados.matricula) {
      localStorage.removeItem("aluno_sessao");
      router.push("/");
      return;
    }
    if (dados.is_active === true || dados.is_active === "true") {
      alert("Você já realizou seu voto!");
      router.push("/");
      return;
    }
    setAlunoDados(dados);
  }, [router]);

  async function registrarVoto(chapaNome: string) {
    const confirmacao = confirm(`Você tem certeza que deseja votar na ${chapaNome}?`);
    if (!confirmacao) return;

    setCarregando(true);
    try {
      const { error: erroVoto } = await supabase
        .from("votacao") 
        .insert([{ 
          chapa: chapaNome, 
          nome: alunoDados.nome,
          matricula: alunoDados.matricula,
          aluno_id: alunoDados.id 
        }]);

      if (erroVoto) throw erroVoto;

      const { error: erroUpdate } = await supabase
        .from("alunos")
        .update({ is_active: true }) 
        .eq("id", alunoDados.id);

      if (erroUpdate) throw erroUpdate;

      localStorage.removeItem("aluno_sessao");
      router.push("/obrigado");
    } catch (error: any) {
      console.error(error);
      alert("Erro ao processar: " + error.message);
    } finally {
      setCarregando(false);
    }
  }

  if (!alunoDados) return null;

  return (
    <div className="min-h-screen bg-[#050505] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black text-white flex flex-col items-center p-6 relative">
      
      {/* IDENTIFICAÇÃO DO ALUNO */}
      <div className="absolute top-6 left-6 animate-in fade-in slide-in-from-left duration-500">
        <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
          <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Eleitor:</span>
          <span className="text-xs font-bold text-white uppercase">{alunoDados.nome}</span>
        </div>
      </div>

      <header className="text-center mt-24 mb-12">
        <h1 className={`${bungee.className} text-4xl md:text-5xl bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent drop-shadow-sm`}>
          ELEIÇÕES GRÊMIO JOPS
        </h1>
        <p className={`${changaOne.className} text-gray-400 mt-3 uppercase tracking-widest text-sm`}>
          Sua voz, sua escolha, seu futuro.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full px-4">
        
        {/* CARD CHAPA 1 */}
        <div className="group bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 hover:border-blue-500/50 transition-all duration-500 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-blue-400 text-2xl font-black">01</div>
          <h2 className={`${bungee.className} text-2xl mb-2 text-white`}>Chapa 1</h2>
          <p className="text-gray-400 text-sm mb-8 italic min-h-[40px]">"Novas ideias para a escola."</p>
          
          <div className="flex w-full gap-3">
            <button
              disabled={carregando}
              onClick={() => registrarVoto("Chapa 1")}
              className={`${bungee.className} flex-[2.5] py-4 rounded-2xl text-xs bg-blue-600 hover:bg-blue-500 transition-all transform active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-900/20`}
            >
              VOTAR 01
            </button>
            <button 
              onClick={() => setModalInfo({aberto: true, chapa: 1})}
              className={`${bungee.className} flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] flex items-center justify-center transition-all border border-white/5`}
            >
              INFO
            </button>
          </div>
        </div>

        {/* CARD CHAPA 2 */}
        <div className="group bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 hover:border-red-500/50 transition-all duration-500 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-400 text-2xl font-black">02</div>
          <h2 className={`${bungee.className} text-2xl mb-2 text-white`}>Chapa 2</h2>
          <p className="text-gray-400 text-sm mb-8 italic min-h-[40px]">"União e compromisso estudantil."</p>
          
          <div className="flex w-full gap-3">
            <button
              disabled={carregando}
              onClick={() => registrarVoto("Chapa 2")}
              className={`${bungee.className} flex-[2.5] py-4 rounded-2xl text-xs bg-red-600 hover:bg-red-500 transition-all transform active:scale-95 disabled:opacity-50 shadow-lg shadow-red-900/20`}
            >
              VOTAR 02
            </button>
            <button 
              onClick={() => setModalInfo({aberto: true, chapa: 2})}
              className={`${bungee.className} flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] flex items-center justify-center transition-all border border-white/5`}
            >
              INFO
            </button>
          </div>
        </div>

        {/* CARD VOTO NULO CENTRALIZADO */}
        <div className="md:col-span-2 flex justify-center mt-4">
          <div className="group bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all duration-500 shadow-xl flex flex-col items-center text-center max-w-sm w-full">
            <h2 className={`${bungee.className} text-lg mb-1 text-gray-500`}>Voto Nulo</h2>
            <p className="text-gray-600 text-[9px] mb-4 uppercase tracking-widest font-bold">Opção de abstenção</p>
            
            <button
              disabled={carregando}
              onClick={() => registrarVoto("Nulo")}
              className={`${bungee.className} w-full py-3 rounded-xl text-xs bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all transform active:scale-95 disabled:opacity-50`}
            >
              CONFIRMAR NULO
            </button>
          </div>
        </div>
      </div>

      <div className="h-20"></div>

      {/* MODAL INTEGRANTES */}
      {modalInfo.aberto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center px-6 z-50 animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] p-8 rounded-[2.5rem] max-w-lg w-full border border-white/10 shadow-2xl relative">
            <button 
              onClick={() => setModalInfo({aberto: false, chapa: null})}
              className="absolute top-6 right-6 text-gray-500 hover:text-white text-2xl"
            >✕</button>

            <h2 className={`${bungee.className} text-xl text-blue-400 mb-8 text-center`}>
              {modalInfo.chapa === 1 ? "Integrantes Chapa 1" : "Integrantes Chapa 2"}
            </h2>

            <div className="space-y-3 text-gray-300 text-[11px] overflow-y-auto max-h-[55vh] pr-4 custom-scrollbar uppercase font-bold tracking-tight">
                {modalInfo.chapa === 1 ? (
                  <>
                    <p><span className="text-blue-500/50">Presidente:</span> Julya Alicia Rolim de Araújo</p>
                    <p><span className="text-blue-500/50">Vice-presidente:</span> Sabino Pessoa do Amaral Neto</p>
                    <p><span className="text-blue-500/50">Secretária geral:</span> Anaís Maria Tavares Coêlho</p>
                    <p><span className="text-blue-500/50">Primeira secretária:</span> Maria Vitória Severo da Silva</p>
                    <p><span className="text-blue-500/50">Tesoureiro geral:</span> Isak Martins de Figueiredo</p>
                    <p><span className="text-blue-500/50">Primeira tesoureira:</span> Beatriz Feitosa Cabral Lima</p>
                    <p><span className="text-blue-500/50">Políticas Sociais:</span> David Ruan Silva Santos</p>
                    <p><span className="text-blue-500/50">Comunicação:</span> Isabela da Silva Tavares</p>
                    <p><span className="text-blue-500/50">Esportes:</span> Francisco Sérgio Claudino Andrade</p>
                    <p><span className="text-blue-500/50">Cultura:</span> Marielly Aparecida Lopes Cabral</p>
                    <p><span className="text-blue-500/50">Educação:</span> Laila Candido Pereira</p>
                    <p><span className="text-blue-500/50">Meio Ambiente:</span> Ana Clara Pereira Alves</p>
                    <p><span className="text-blue-500/50">Saúde:</span> Bruna Silva Santos</p>
                    <p><span className="text-blue-500/50">Diversidade:</span> Maria Alzenir Alves Macedo</p>
                    <p><span className="text-blue-500/50">Mulher:</span> Maria Edwiges Leonardo Batista</p>
                    <p><span className="text-blue-500/50">Relações Étnicas:</span> Dayllan Camilo Cardoso</p>
                    <p><span className="text-blue-500/50">Suplente:</span> Jackson Guilherme Sales Mattos</p>
                  </>
                ) : (
                  <p className="text-center py-10 text-gray-500 italic">Lista de integrantes não fornecida para a Chapa 2.</p>
                )}
            </div>

            <button 
              onClick={() => setModalInfo({aberto: false, chapa: null})} 
              className={`${bungee.className} w-full mt-10 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition text-[10px] uppercase tracking-widest border border-white/5`}
            >
              FECHAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}