"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  data_nascimento: string;
  is_active: boolean;
}

export default function EleitoresPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [filtro, setFiltro] = useState<"todos" | "votou" | "pendente">("todos");
  const [busca, setBusca] = useState(""); 
  const [loading, setLoading] = useState(true);

  // Estados para Modais
  const [editando, setEditando] = useState<Aluno | null>(null);
  const [isInserindo, setIsInserindo] = useState(false);
  const [alunoParaExcluir, setAlunoParaExcluir] = useState<Aluno | null>(null);

  // Estado para Novo Aluno
  const [novoAluno, setNovoAluno] = useState({
    nome: "",
    matricula: "",
    data_nascimento: "",
  });

  useEffect(() => {
    fetchAlunos();
  }, []);

  async function fetchAlunos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("alunos")
      .select("*")
      .order("nome", { ascending: true });

    if (!error && data) setAlunos(data);
    setLoading(false);
  }

  async function handleInserirAluno() {
    if (!novoAluno.nome || !novoAluno.matricula || !novoAluno.data_nascimento) {
      alert("Preencha todos os campos");
      return;
    }

    const { error } = await supabase.from("alunos").insert([
      {
        nome: novoAluno.nome.toUpperCase(),
        matricula: novoAluno.matricula,
        data_nascimento: novoAluno.data_nascimento,
        is_active: false,
      },
    ]);

    if (error) alert("Erro ao inserir aluno");
    else {
      setNovoAluno({ nome: "", matricula: "", data_nascimento: "" });
      setIsInserindo(false);
      fetchAlunos();
    }
  }

  async function confirmarExclusao() {
    if (!alunoParaExcluir) return;
    const { error } = await supabase.from("alunos").delete().eq("id", alunoParaExcluir.id);
    if (error) alert("Erro ao deletar");
    else {
      setAlunoParaExcluir(null);
      fetchAlunos();
    }
  }

  async function salvarEdicao() {
    if (!editando) return;
    const { error } = await supabase
      .from("alunos")
      .update({ 
        nome: editando.nome.toUpperCase(), 
        matricula: editando.matricula,
        data_nascimento: editando.data_nascimento 
      })
      .eq("id", editando.id);

    if (error) alert("Erro ao atualizar");
    else {
      setEditando(null);
      fetchAlunos();
    }
  }

  // --- LÓGICA DE FILTRO ATUALIZADA (APENAS POR NOME) ---
  const alunosFiltrados = alunos.filter((a) => {
    const termoBusca = busca.toLowerCase();
    const matchesNome = a.nome.toLowerCase().includes(termoBusca);

    if (filtro === "votou") return a.is_active === true && matchesNome;
    if (filtro === "pendente") return a.is_active === false && matchesNome;
    return matchesNome;
  });

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        
        <header className="mb-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-1">
                Painel de Controle
              </h2>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                Lista de Eleitores
              </h1>
            </div>

            <button 
              onClick={() => setIsInserindo(true)}
              className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 text-white"
            >
              + Inserir Aluno
            </button>
          </div>

          {/* BARRA DE PESQUISA (APENAS NOME) */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-[#1E293B] p-4 rounded-[2rem] border border-[#334155] shadow-xl">
            <div className="relative flex-1 w-full">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              <input 
                type="text"
                placeholder="Pesquisar aluno pelo nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-gray-600"
              />
            </div>

            <div className="flex gap-2 p-1 bg-black/20 rounded-2xl border border-white/5">
              {["todos", "votou", "pendente"].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFiltro(f as any)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filtro === f 
                    ? "bg-white text-black shadow-lg" 
                    : "text-gray-500 hover:text-white"
                  }`}
                >
                  {f === "todos" ? "Todos" : f === "votou" ? "Votaram" : "Pendentes"}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="bg-[#1E293B] rounded-[2rem] border border-[#334155] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-[10px] uppercase tracking-widest text-gray-500">
                <th className="p-6">Nome do Aluno</th>
                <th className="p-6">Matrícula</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {alunosFiltrados.length > 0 ? (
                alunosFiltrados.map((aluno) => (
                  <tr key={aluno.id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                    <td className="p-6 font-bold">{aluno.nome.toUpperCase()}</td>
                    <td className="p-6 font-mono text-gray-400">{aluno.matricula}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        aluno.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500"
                      }`}>
                        {aluno.is_active ? "Votou" : "Não Votou"}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-3">
                      <button onClick={() => setEditando(aluno)} className="text-indigo-400 hover:text-white transition uppercase text-[10px] font-black">Editar</button>
                      <button onClick={() => setAlunoParaExcluir(aluno)} className="text-red-500 hover:text-red-400 transition uppercase text-[10px] font-black">Apagar</button>
                    </td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-500 uppercase text-xs font-black tracking-widest">
                      Nenhum nome corresponde à busca
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          {loading && <p className="p-10 text-center text-gray-500 animate-pulse uppercase tracking-widest text-xs font-black">Sincronizando Banco de Dados...</p>}
        </div>
      </main>

      {/* MODAIS (INSERÇÃO, EDIÇÃO E EXCLUSÃO) PERMANECEM IGUAIS AO SEU CÓDIGO ANTERIOR */}
      {/* ... (Inserindo, Editando, AlunoParaExcluir) */}
      
    </div>
  );
}