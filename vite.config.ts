import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  // Le port vient de l'environnement quand un lanceur en assigne un (PORT), et retombe
  // sur 5173 sinon. Rien n'exige 5173 : pas de callback OAuth, pas de CORS figé.
  server: { port: Number(process.env.PORT) || 5173, host: '127.0.0.1' },
  build: { target: 'es2021' },
});
