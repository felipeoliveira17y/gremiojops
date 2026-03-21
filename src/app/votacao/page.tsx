"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bungee, Changa_One } from "next/font/google";
import { supabase } from "@/lib/supabase";

const bungee = Bungee({ weight: "400", subsets: ["latin"] });
const changaOne = Changa_One({ weight: "400", subsets: ["latin"] });

const integrantesChapa1 = [
  { cargo: "Presidente", nome: "Julya Alicia Rolim de Araújo" },
  { cargo: "Vice-presidente", nome: "Sabino Pessoa do Amaral Neto" },
  { cargo: "Secretária geral", nome: "Anaís Maria Tavares Coêlho" },
  { cargo: "Primeira secretária", nome: "Maria Vitória Severo da Silva" },
  { cargo: "Tesoureiro geral", nome: "Isak Martins de Figueiredo" },
  { cargo: "Primeira tesoureira", nome: "Beatriz Feitosa Cabral Lima" },
  { cargo: "Diretor de políticas sociais", nome: "David Ruan Silva Santos" },
  { cargo: "Diretora de comunicação", nome: "Isabela da Silva Tavares" },
  { cargo: "Diretor de esportes", nome: "Francisco Sérgio Claudino Andrade" },
  { cargo: "Diretora de cultura", nome: "Marielly Aparecida Lopes Cabral" },
  { cargo: "Diretor de políticas educacionais", nome: "Laila Candido Pereira" },
  { cargo: "Diretora de meio ambiente", nome: "Ana Clara Pereira Alves" },
  { cargo: "Diretora de saúde", nome: "Bruna Silva Santos" },
  { cargo: "Diretora de diversidade e gênero", nome: "Maria Alzenir Alves Macedo" },
  { cargo: "Diretora de mulher", nome: "Maria Edwiges Leonardo Batista" },
  { cargo: "Diretor de relações étnico-raciais", nome: "Dayllan Camilo Cardoso" },
  { cargo: "Suplência", nome: "Jackson Guilherme Sales Mattos" },
];

export default function VotacaoPage() {
  const [alunoDados, setAlunoDados] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const [modalInfo, setModalInfo] = useState<{ aberto: boolean, chapa: number | null }>({
    aberto: false,
    chapa: null
  });

  const [confirmacao, setConfirmacao] = useState<{ aberto: boolean, chapaNome: string }>({
    aberto: false,
    chapaNome: ""
  });

  // BLOQUEIO DE SCROLL DO BODY
  useEffect(() => {
    if (modalInfo.aberto || confirmacao.aberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // Cleanup para garantir que o scroll volte se o componente for desmontado
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalInfo.aberto, confirmacao.aberto]);

  useEffect(() => {
    const sessao = localStorage.getItem("aluno_sessao");
    if (!sessao) {
      router.push("/");
      return;
    }
    const dados = JSON.parse(sessao);
    if (dados.is_active === true || dados.is_active === "true") {
      router.push("/");
      return;
    }
    setAlunoDados(dados);
  }, [router]);

  function abrirConfirmacao(chapa: string) {
    setConfirmacao({ aberto: true, chapaNome: chapa });
  }

  async function finalizarVoto() {
    setCarregando(true);
    const chapaNome = confirmacao.chapaNome;

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
      alert("Erro ao processar voto.");
      setConfirmacao({ aberto: false, chapaNome: "" });
    } finally {
      setCarregando(false);
    }
  }

  if (!alunoDados) return null;

  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#020617] to-black text-white flex flex-col items-center p-6 relative overflow-x-hidden">

      {/* MODAL DE CONFIRMAÇÃO DE VOTO */}
      {confirmacao.aberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-sm rounded-[3rem] p-8 shadow-2xl text-center shadow-indigo-500/10">
            <div className={`w-20 h-20 rounded-3xl mb-6 mx-auto flex items-center justify-center text-3xl font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner`}>
              ?
            </div>
            <h3 className={`${bungee.className} text-xl mb-2 text-white uppercase tracking-tight`}>Confirmar Voto?</h3>
            <p className="text-slate-400 text-[11px] mb-8 leading-relaxed uppercase font-bold tracking-widest">
              Você está prestes a votar na <br/><span className="text-indigo-400 font-black underline underline-offset-4">{confirmacao.chapaNome}</span>.
            </p>
            <div className="flex flex-col gap-3">
              <button
                disabled={carregando}
                onClick={finalizarVoto}
                className={`${bungee.className} w-full py-5 bg-indigo-600 text-white rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50`}
              >
                {carregando ? "Sincronizando..." : "CONFIRMAR VOTO"}
              </button>
              <button
                disabled={carregando}
                onClick={() => setConfirmacao({ aberto: false, chapaNome: "" })}
                className="w-full py-4 bg-transparent text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
              >
                VOLTAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IDENTIFICAÇÃO DO ALUNO */}
      <div className="absolute top-8 left-8 animate-in fade-in slide-in-from-top duration-700">
        <div className="bg-white/5 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black text-indigo-400 tracking-[0.2em]">Eleitor Autenticado</span>
            <span className="text-xs font-bold text-white uppercase tracking-tight">{alunoDados.nome}</span>
          </div>
        </div>
      </div>

      <header className="text-center mt-32 mb-16">
        <h1 className={`${bungee.className} text-4xl md:text-6xl bg-gradient-to-b from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent tracking-tighter`}>
          GRÊMIO JOPS
        </h1>
        <div className="h-1 w-24 bg-indigo-600 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.6)]"></div>
        <p className={`${changaOne.className} text-slate-500 mt-6 uppercase tracking-[0.3em] text-[10px] font-bold`}>
          Sua voz molda o nosso amanhã.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full px-4 mb-20">
        <div className="group bg-[#0f172a]/40 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/5 hover:border-indigo-500/40 transition-all duration-500 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[50px] -mr-16 -mt-16"></div>
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 text-2xl font-black group-hover:scale-110 transition-transform">01</div>
          <h2 className={`${bungee.className} text-2xl mb-3 text-white tracking-tight`}>Conexão Jovem</h2>
          <p className="text-slate-400 text-[11px] mb-10 italic uppercase font-bold tracking-widest min-h-[40px]">"Unindo ideias, fortalecendo vozes."</p>
          <div className="flex w-full gap-3">
            <button
              onClick={() => abrirConfirmacao("Chapa 1")}
              className={`${bungee.className} flex-[2.5] py-5 rounded-2xl text-[10px] bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 tracking-widest`}
            >
              VOTAR 01
            </button>
            <button 
              onClick={() => setModalInfo({aberto: true, chapa: 1})}
              className={`${bungee.className} flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] flex items-center justify-center transition-all border border-white/5 tracking-tighter`}
            >
              INFO
            </button>
          </div>
        </div>

        <div className="group bg-[#0f172a]/40 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/5 hover:border-indigo-500/40 transition-all duration-500 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 blur-[50px] -mr-16 -mt-16"></div>
          <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-6 text-violet-400 text-2xl font-black group-hover:scale-110 transition-transform">02</div>
          <h2 className={`${bungee.className} text-2xl mb-3 text-white tracking-tight`}>Chapa 02</h2>
          <p className="text-slate-400 text-[11px] mb-10 italic uppercase font-bold tracking-widest min-h-[40px]">"União e compromisso estudantil."</p>
          <div className="flex w-full gap-3">
            <button
              onClick={() => abrirConfirmacao("Chapa 2")}
              className={`${bungee.className} flex-[2.5] py-5 rounded-2xl text-[10px] bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 tracking-widest`}
            >
              VOTAR 02
            </button>
            <button 
              onClick={() => setModalInfo({aberto: true, chapa: 2})}
              className={`${bungee.className} flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] flex items-center justify-center transition-all border border-white/5 tracking-tighter`}
            >
              INFO
            </button>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-center mt-4">
          <button
            onClick={() => abrirConfirmacao("Nulo")}
            className={`${bungee.className} px-12 py-4 rounded-2xl text-[10px] bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 transition-all tracking-[0.3em]`}
          >
            CONFIRMAR VOTO NULO
          </button>
        </div>
      </div>

      {/* MODAL INTEGRANTES */}
      {modalInfo.aberto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center px-4 z-[110] animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#0f172a] border border-white/10 p-8 md:p-10 rounded-[3.5rem] max-w-md w-full shadow-2xl relative shadow-indigo-500/5">
            <button 
              onClick={() => setModalInfo({aberto: false, chapa: null})}
              className="absolute top-8 right-8 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-500 hover:text-white transition-colors"
            >✕</button>
            
            <div className="text-center mb-8">
              <span className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em]">Composição da</span>
              <h2 className={`${bungee.className} text-2xl text-white mt-1`}>
                {modalInfo.chapa === 1 ? "CHAPA 01" : "CHAPA 02"}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar border-y border-white/5 py-6">
                {modalInfo.chapa === 1 ? (
                  integrantesChapa1.map((membro, i) => (
                    <div key={i} className="flex flex-col gap-0.5 border-b border-white/[0.03] pb-2 mb-2">
                      <span className="text-[8px] text-indigo-500 font-black uppercase tracking-widest">
                        {membro.cargo}
                      </span>
                      <span className="text-[11px] text-slate-200 font-bold uppercase leading-tight">
                        {membro.nome}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-16 text-slate-600 text-[10px] uppercase font-black italic tracking-[0.2em]">
                    Dados em processamento...
                  </p>
                )}
            </div>

            <button 
              onClick={() => setModalInfo({aberto: false, chapa: null})} 
              className={`${bungee.className} w-full mt-8 py-5 rounded-2xl bg-white text-black hover:bg-indigo-600 hover:text-white transition-all text-[10px] uppercase tracking-widest shadow-xl`}
            > 
              FECHAR LISTA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}