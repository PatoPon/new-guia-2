// postcss.config.js
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss,  // Adiciona o Tailwind como plugin
    autoprefixer, // Autoprefixer é importante para garantir a compatibilidade com navegadores
  ],
};
