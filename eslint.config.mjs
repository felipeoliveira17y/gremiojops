/** @type {import('next').NextConfig} */
const nextConfig = {
  // Esta seção faz a "máscara" da URL
  async rewrites() {
    return [
      {
        source: '/votar',        // O que aparece na URL
        destination: '/votacao', // A pasta real no seu projeto
      },
      {
        source: '/painel',       // O que aparece na URL
        destination: '/adm',     // A pasta real no seu projeto
      },
      {
        source: '/concluido',    // O que aparece na URL
        destination: '/obrigado',// A pasta real no seu projeto
      },
    ];
  },
};

export default nextConfig;