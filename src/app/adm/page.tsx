"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdmPage() {
  const router = useRouter();
  const [candidatos, setCandidatos] = useState([
    { nome: "Chapa 1", votos: 0 },
    { nome: "Chapa 2", votos: 0 },
    { nome: "Nulo", votos: 0 },
  ]);

  const [alunos, setAlunos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  
  // Estados para novo aluno
  const [novoAluno, setNovoAluno] = useState({ nome: "", matricula: "", data_nascimento: "" });
  const [loadingAdd, setLoadingAdd] = useState(false);

  useEffect(() => {
    const sessao = localStorage.getItem("user_session");
    if (!sessao) {
      router.push("/");
      return;
    }

    const dados = JSON.parse(sessao);
    if (dados.role !== "adm") {
      router.push("/");
      return;
    }

    buscarVotos();
    buscarAlunos();

    const channel = supabase
      .channel("votos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "votacao" }, () => buscarVotos())
      .on("postgres_changes", { event: "*", schema: "public", table: "alunos" }, () => buscarAlunos())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  async function buscarVotos() {
    const { data, error } = await supabase.from("votacao").select("chapa");
    if (error) return;

    let c1 = 0, c2 = 0, nulo = 0;
    data?.forEach((v) => {
      const chapaVotada = v.chapa?.toLowerCase().trim();
      if (chapaVotada === "chapa 1" || chapaVotada === "chapa 01" || chapaVotada === "1") c1++;
      else if (chapaVotada === "chapa 2" || chapaVotada === "chapa 02" || chapaVotada === "2") c2++;
      else nulo++;
    });

    setCandidatos([
      { nome: "Chapa 1", votos: c1 },
      { nome: "Chapa 2", votos: c2 },
      { nome: "Nulo", votos: nulo },
    ]);
  }

  async function buscarAlunos() {
    const { data, error } = await supabase
      .from("alunos")
      .select("*") 
      .order("nome", { ascending: true });

    if (error) return;
    setAlunos(data || []);
  }

  // Função para inserir aluno
  async function handleAddAluno(e: React.FormEvent) {
    e.preventDefault();
    setLoadingAdd(true);

    // Formata a data de DD/MM/AAAA para AAAA-MM-DD para o banco
    const [dia, mes, ano] = novoAluno.data_nascimento.split("/");
    const dataISO = `${ano}-${mes}-${dia}`;

    const { error } = await supabase.from("alunos").insert([
      { 
        nome: novoAluno.nome.toUpperCase(), 
        matricula: novoAluno.matricula, 
        data_nascimento: dataISO,
        is_active: false 
      }
    ]);

    if (error) {
      alert("Erro ao inserir: " + error.message);
    } else {
      setNovoAluno({ nome: "", matricula: "", data_nascimento: "" });
      alert("Aluno cadastrado com sucesso!");
    }
    setLoadingAdd(false);
  }

  // Lógica de contagem
  const totalVotos = candidatos.reduce((acc, c) => acc + c.votos, 0);
  const totalFaltam = alunos.filter(a => !a.is_active).length;
  const totalJaVotaram = alunos.filter(a => a.is_active).length;
  const vencedor = candidatos.reduce((prev, current) => prev.votos > current.votos ? prev : current);

  const dataChart = {
    labels: candidatos.map(c => c.nome),
    datasets: [{
      label: "Votos",
      data: candidatos.map(c => c.votos),
      backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(239, 68, 68, 0.8)", "rgba(156, 163, 175, 0.8)"],
      borderRadius: 10,
    }],
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-yellow-400 italic tracking-tighter">PAINEL ADM</h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest">Controle Geral de Eleição</p>
          </div>
          <button onClick={() => {localStorage.clear(); router.push('/')}} className="bg-red-500/20 text-red-500 px-4 py-2 rounded-xl text-xs font-bold border border-red-500/30">SAIR</button>
        </header>

        {/* CARDS DE RESUMO ATUALIZADOS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
            <p className="text-[10px] text-blue-400 uppercase font-bold">Já Votaram</p>
            <p className="text-4xl font-black">{totalJaVotaram}</p>
          </div>
          <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
            <p className="text-[10px] text-red-400 uppercase font-bold">Ainda Faltam</p>
            <p className="text-4xl font-black">{totalFaltam}</p>
          </div>
          <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Participação</p>
            <p className="text-4xl font-black">
              {alunos.length > 0 ? ((totalJaVotaram / alunos.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
            <p className="text-[10px] text-yellow-400 uppercase font-bold">Líder</p>
            <p className="text-xl font-bold truncate">{totalVotos > 0 ? vencedor.nome : "--"}</p>
          </div>
        </div>

        {/* ÁREA DE INSERÇÃO DE ALUNO */}
        <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 mb-8 shadow-2xl">
          <h2 className="text-lg font-bold mb-6">CADASTRAR NOVO ALUNO</h2>
          <form onSubmit={handleAddAluno} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              required
              placeholder="NOME COMPLETO"
              className="bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-yellow-400"
              value={novoAluno.nome}
              onChange={e => setNovoAluno({...novoAluno, nome: e.target.value})}
            />
            <input 
              required
              placeholder="MATRÍCULA"
              className="bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-yellow-400"
              value={novoAluno.matricula}
              onChange={e => setNovoAluno({...novoAluno, matricula: e.target.value})}
            />
            <input 
              required
              placeholder="DD/MM/AAAA"
              className="bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-yellow-400"
              value={novoAluno.data_nascimento}
              onChange={e => {
                let v = e.target.value.replace(/\D/g, "");
                if (v.length > 2) v = v.replace(/(\d{2})(\d)/, "$1/$2");
                if (v.length > 5) v = v.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
                setNovoAluno({...novoAluno, data_nascimento: v.slice(0, 10)});
              }}
            />
            <button 
              disabled={loadingAdd}
              className="bg-yellow-400 text-black font-black rounded-2xl py-3 hover:bg-yellow-300 transition-all disabled:opacity-50"
            >
              {loadingAdd ? "SALVANDO..." : "ADICIONAR"}
            </button>
          </form>
        </div>

        {/* GRÁFICO */}
        <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 mb-8 h-80">
          <Bar data={dataChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>

        {/* LISTA DE ALUNOS */}
        <div className="bg-black/30 p-6 md:p-10 rounded-[40px] border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Eleitores ({alunos.length})</h2>
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-white/10 border border-white/20 rounded-full px-6 py-2 text-sm focus:outline-none w-64"
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 30).map(aluno => (
              <div key={aluno.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-gray-500">{aluno.matricula}</span>
                   <span className="text-xs font-medium uppercase truncate w-40">{aluno.nome}</span>
                </div>
                {aluno.is_active ? 
                  <span className="text-[9px] bg-green-500/20 text-green-400 font-black px-3 py-1 rounded-full border border-green-500/30">VOTOU</span> : 
                  <span className="text-[9px] bg-red-500/20 text-red-400 font-black px-3 py-1 rounded-full border border-red-500/30">PENDENTE</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}