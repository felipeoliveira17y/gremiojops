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

// Registro dos componentes do Chart.js
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

  useEffect(() => {
    // Verificar se é professor/adm
    const sessao = localStorage.getItem("user_session");
    if (!sessao) {
      router.push("/");
      return;
    }

    const dados = JSON.parse(sessao);
    if (dados.role !== "adm") {
      alert("Acesso restrito a professores!");
      router.push("/");
      return;
    }

    buscarVotos();
    buscarAlunos();

    // Configuração do Realtime
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
    
    if (error) {
      console.error("Erro ao buscar votos:", error);
      return;
    }

    let c1 = 0;
    let c2 = 0;
    let nulo = 0;

    data?.forEach((v) => {
      const chapaVotada = v.chapa?.toLowerCase().trim();
      if (chapaVotada === "chapa 1" || chapaVotada === "chapa 01" || chapaVotada === "1") {
        c1++;
      } else if (chapaVotada === "chapa 2" || chapaVotada === "chapa 02" || chapaVotada === "2") {
        c2++;
      } else {
        nulo++;
      }
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
      .select("id, nome, is_active") 
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao buscar alunos:", error.message);
      return;
    }
    setAlunos(data || []);
  }

  const alunosFiltrados = alunos.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const totalVotos = candidatos.reduce((acc, c) => acc + c.votos, 0);
  const vencedor = candidatos.reduce((prev, current) => prev.votos > current.votos ? prev : current);

  const dataChart = {
    labels: candidatos.map(c => c.nome),
    datasets: [{
      label: "Quantidade de Votos",
      data: candidatos.map(c => c.votos),
      backgroundColor: [
        "rgba(59, 130, 246, 0.8)", 
        "rgba(239, 68, 68, 0.8)",  
        "rgba(156, 163, 175, 0.8)" 
      ],
      borderRadius: 10,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      x: { ticks: { color: "#fff" }, grid: { display: false } }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-black text-yellow-400 italic tracking-tighter">
            PAINEL ADMINISTRATIVO - GRÊMIO
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Apuração em Tempo Real</p>
        </header>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 p-5 rounded-3xl border border-white/10 shadow-lg">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Total de Votos</p>
            <p className="text-4xl font-black">{totalVotos}</p>
          </div>
          <div className="bg-white/5 p-5 rounded-3xl border border-white/10 shadow-lg">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Líder Atual</p>
            <p className="text-xl font-bold text-green-400 truncate">
              {totalVotos > 0 ? vencedor.nome : "Aguardando..."}
            </p>
          </div>
          <div className="bg-white/5 p-5 rounded-3xl border border-white/10 shadow-lg">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Participação</p>
            <p className="text-4xl font-black">
              {alunos.length > 0 ? ((totalVotos / alunos.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="bg-white/5 p-5 rounded-3xl border border-white/10 shadow-lg">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Total Eleitores</p>
            <p className="text-4xl font-black">{alunos.length}</p>
          </div>
        </div>

        {/* GRÁFICO */}
        <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 mb-8 shadow-2xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
            RESULTADOS PARCIAIS
          </h2>
          <div className="h-72">
            <Bar data={dataChart} options={chartOptions} />
          </div>
        </div>

        {/* TABELA DE ALUNOS COM BUSCA */}
        <div className="bg-black/30 p-6 md:p-10 rounded-[40px] border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold">Lista de Eleitores</h2>
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              className="bg-white/10 border border-white/20 rounded-full px-6 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full md:w-64"
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alunosFiltrados.slice(0, 20).map(aluno => (
              <div key={aluno.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition">
                <span className="text-[10px] md:text-xs font-medium uppercase truncate pr-4">
                  {aluno.nome}
                </span>
                {aluno.is_active ? 
                  <span className="text-[9px] bg-green-500/20 text-green-400 font-black px-3 py-1 rounded-full border border-green-500/30">VOTOU</span> : 
                  <span className="text-[9px] bg-red-500/20 text-red-400 font-black px-3 py-1 rounded-full border border-red-500/30">PENDENTE</span>
                }
              </div>
            ))}
          </div>
          
          {alunosFiltrados.length === 0 && (
            <p className="text-center text-gray-500 py-10">Nenhum aluno encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}   