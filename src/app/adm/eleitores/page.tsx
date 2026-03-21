"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/Sidebar";

export default function EleitoresPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    buscarAlunos();
  }, []);

  async function buscarAlunos() {
    const { data } = await supabase.from("alunos").select("*").order("nome", { ascending: true });
    setAlunos(data || []);
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-gray-400 text-xs font-black uppercase tracking-[0.3em]">Gerenciamento</h2>
            <h1 className="text-4xl font-black uppercase">Lista de Eleitores</h1>
          </div>
          <input 
            type="text"
            placeholder="BUSCAR NOME..."
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-yellow-400 outline-none w-72"
            onChange={(e) => setBusca(e.target.value)}
          />
        </header>

        <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                <th className="px-8 py-4">Matrícula</th>
                <th className="px-8 py-4">Nome</th>
                <th className="px-8 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase())).map((aluno) => (
                <tr key={aluno.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-4 font-mono text-blue-400 text-sm">{aluno.matricula}</td>
                  <td className="px-8 py-4 text-sm font-bold uppercase">{aluno.nome}</td>
                  <td className="px-8 py-4 text-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                      aluno.is_active 
                      ? "bg-green-500/10 text-green-500 border-green-500/20" 
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {aluno.is_active ? "VOTOU" : "PENDENTE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}