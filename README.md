# Calculadora de custo de impressão 3D

App React (Vite) com deploy automático no GitHub Pages via GitHub Actions.

## Setup

```bash
npm install
npm run dev        # ambiente local, http://localhost:5173
```

## Deploy no GitHub Pages

1. **Crie o repositório no GitHub** (ex: `calc3d`).

2. **Ajuste o `base` em `vite.config.js`** pro nome exato do repositório:
   ```js
   base: "/nome-do-seu-repo/",
   ```

3. **Habilite o Pages via Actions** (uma vez só, no repositório):
   Settings → Pages → Source → **GitHub Actions**.

4. **Suba o código**:
   ```bash
   git init
   git add .
   git commit -m "init: calculadora de custo de impressão 3D"
   git branch -M main
   git remote add origin git@github.com:SEU_USUARIO/nome-do-seu-repo.git
   git push -u origin main
   ```

5. O workflow em `.github/workflows/deploy.yml` builda e publica automaticamente
   a cada push na branch `main`. Acompanhe em Actions → Deploy GitHub Pages.
   URL final: `https://SEU_USUARIO.github.io/nome-do-seu-repo/`

## Nota sobre o histórico

O histórico de projetos usa `localStorage` (ver `src/storage.js`), não
`window.storage` do artifact original. Fica salvo só no navegador/dispositivo
de quem acessa — não sincroniza entre computadores nem é visível pra outros
usuários do site.
