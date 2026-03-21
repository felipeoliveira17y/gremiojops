"use client";
import { Sidebar } from "@/components/Sidebar";

export default function RelatoriosPage() {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-10">
          <h2 className="text-gray-400 text-xs font-black uppercase tracking-[0.3em]">Documentação</h2>
          <h1 className="text-4xl font-black uppercase">Relatórios de Auditoria</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BOTÃO DE EXPORTAR ATA */}
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:border-yellow-400/50 transition-all group cursor-pointer">
            <h3 className="text-xl font-bold mb-2 uppercase">Gerar Ata Final</h3>
            <p className="text-gray-400 text-sm mb-6">Gera um documento formatado com o resultado oficial e estatísticas de participação para impressão.</p>
            <button className="bg-yellow-400 text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest group-hover:scale-105 transition-transform">
              Baixar PDF
            </button>
          </div>

          {/* BOTÃO DE LISTA DE PRESENÇA */}
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:border-blue-400/50 transition-all group cursor-pointer">
            <h3 className="text-xl font-bold mb-2 uppercase">Lista de Comparecimento</h3>
            <p className="text-gray-400 text-sm mb-6">Exporta a planilha com nome e matrícula de todos os alunos que registraram seu voto.</p>
            <button className="bg-blue-600 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest group-hover:scale-105 transition-transform">
              Exportar Excel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}