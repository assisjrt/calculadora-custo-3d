import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Domínio customizado (calc3d.betozostore.com) serve o site na raiz,
// por isso o base precisa ser "/" em vez do subcaminho do repositório.
export default defineConfig({
  plugins: [react()],
  base: "/",
});
