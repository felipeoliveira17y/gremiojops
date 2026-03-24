import { createClient } from '@supabase/supabase-js';

// 1. Você PRECISA declarar a constante 'supabase' aqui fora das funções
const SUPABASE_URL = 'https://ddmulvuqafwjwpeyxaap.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbXVsdnVxYWZ3andwZXl4YWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDkxMTQsImV4cCI6MjA4ODgyNTExNH0.HD2kOMgxyCFlqKKyl4ekYPppu1RwvDJdHRxKbLjhI2Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function simularJornadaAluno(id: number) {
  const matriculaTeste = id; 
  const nomeTeste = `Estudante de Teste ${id}`;

  try {
    // Agora o 'supabase' será reconhecido aqui dentro
    const { data: aluno, error: erroLogin } = await supabase
      .from('alunos')
      .select('*')
      .eq('matricula', matriculaTeste)
      .single();

    if (erroLogin || !aluno) throw new Error(`Login falhou para ${matriculaTeste}`);

    const { error: erroVoto } = await supabase
      .from('votacao')
      .insert([{
        chapa: 'Chapa 3',
        nome: aluno.nome,
        matricula: String(aluno.matricula),
        aluno_id: aluno.id
      }]);

    if (erroVoto) throw erroVoto;

    await supabase
      .from('alunos')
      .update({ is_active: true })
      .eq('id', aluno.id);

    console.log(`✅ Aluno ${id} votou!`);

  } catch (err: any) {
    console.error(`❌ Erro no aluno ${id}: ${err.message}`);
  }
}

// Função para rodar o loop
async function rodar(total: number) {
    for(let i=1; i<=total; i++) {
        await simularJornadaAluno(i);
    }
}

rodar(300);