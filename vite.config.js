import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANTE: troque "calc3d" pelo nome exato do seu repositório no GitHub.
// Se o repo for github.com/SEU_USUARIO/minha-calculadora, use "/minha-calculadora/".
// Sem isso, o build funciona local mas os assets (JS/CSS) quebram no GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: "/calc3d/",
});
