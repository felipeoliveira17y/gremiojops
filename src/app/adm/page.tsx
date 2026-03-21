"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bar } from "react-chartjs-2";
import { Sidebar } from "@/components/Sidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
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

  useEffect(() => {
    const sessao = localStorage.getItem("user_session");
    if (!sessao) { router.push("/"); return; }

    const dados = JSON.parse(sessao);
    if (dados.role !== "adm") { router.push("/"); return; }

    buscarVotos();
    buscarAlunos();

    const channel = supabase
      .channel("votos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "votacao" }, () => buscarVotos())
      .on("postgres_changes", { event: "*", schema: "public", table: "alunos" }, () => buscarAlunos())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  async function buscarVotos() {
    const { data } = await supabase.from("votacao").select("chapa");

    let c1 = 0, c2 = 0, nulo = 0;

    data?.forEach((v) => {
      const chapaVotada = v.chapa?.toLowerCase().trim();

      if (["chapa 1", "chapa 01", "1"].includes(chapaVotada)) c1++;
      else if (["chapa 2", "chapa 02", "2"].includes(chapaVotada)) c2++;
      else nulo++;
    });

    setCandidatos([
      { nome: "Chapa 1", votos: c1 },
      { nome: "Chapa 2", votos: c2 },
      { nome: "Nulo", votos: nulo },
    ]);
  }

  async function buscarAlunos() {
    const { data } = await supabase.from("alunos").select("is_active");
    setAlunos(data || []);
  }

  const totalVotos = candidatos.reduce((acc, c) => acc + c.votos, 0);
  const totalJaVotaram = alunos.filter(a => a.is_active).length;
  const totalFaltam = alunos.length - totalJaVotaram;
  const vencedor = candidatos.reduce((prev, current) =>
    prev.votos > current.votos ? prev : current
  );

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">

        <header className="mb-10">
          <h2 className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">
            Visão Geral
          </h2>

          <h1 className="text-4xl font-black text-blue-400">
            ESTATÍSTICAS AO VIVO
          </h1>
        </header>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CardResumo titulo="Votos Computados" valor={totalJaVotaram} cor="text-blue-400" />
          <CardResumo titulo="Faltam Votar" valor={totalFaltam} cor="text-red-400" />
          <CardResumo titulo="Participação" valor={`${alunos.length > 0 ? ((totalJaVotaram / alunos.length) * 100).toFixed(1) : 0}%`} cor="text-green-400" />
          <CardResumo titulo="Líder Atual" valor={totalVotos > 0 ? vencedor.nome : "--"} cor="text-yellow-400" />
        </div>

        {/* GRÁFICO */}
        <div className="bg-[#1E293B] p-8 rounded-[2.5rem] border border-[#334155] h-[400px] shadow-xl">
          <Bar
            data={{
              labels: candidatos.map(c => c.nome),
              datasets: [{
                label: "Votos",
                data: candidatos.map(c => c.votos),
                backgroundColor: [
                  "#3B82F6", // azul
                  "#EF4444", // vermelho
                  "#6B7280"  // cinza
                ],
                borderRadius: 10,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                x: {
                  ticks: { color: "#9CA3AF" },
                  grid: { color: "rgba(255,255,255,0.05)" }
                },
                y: {
                  ticks: { color: "#9CA3AF" },
                  grid: { color: "rgba(255,255,255,0.05)" }
                }
              }
            }}
          />
        </div>

      </main>
    </div>
  );
}

function CardResumo({ titulo, valor, cor }: { titulo: string, valor: any, cor: string }) {
  return (
    <div className="bg-[#1E293B] p-6 rounded-3xl border border-[#334155] shadow-xl">
      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">
        {titulo}
      </p>

      <p className={`text-3xl font-black ${cor}`}>
        {valor}
      </p>
    </div>
  );
}