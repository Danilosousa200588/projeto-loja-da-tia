# Publicação e Deploy da Loja Bem Garota

Este projeto é uma aplicação web integrada (Vite + React no frontend e Express no backend). Está pronto para ser versionado no GitHub e publicado diretamente na Vercel.

---

## 🚀 Como subir para o GitHub

1. Inicialize o repositório Git local e crie o commit:
   ```bash
   git init
   git add .
   git commit -m "feat: loja Bem Garota integrada com vitrine de vídeo e painel admin"
   ```

2. Vincule ao seu repositório remoto no GitHub (substitua pelo link do seu repositório):
   ```bash
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```

---

## ⚡ Como fazer o Deploy na Vercel

### Opção 1: Direto pelo painel web da Vercel (Recomendado)
1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
2. Clique em **"Add New..."** > **"Project"**.
3. Selecione o repositório da loja `bem-garota`.
4. A Vercel detectará automaticamente o framework como **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Configure as Variáveis de Ambiente (se desejar usar recursos de IA do Google GenAI):
   - `GEMINI_API_KEY`: sua chave de API (opcional)
6. Clique em **"Deploy"**.

A Vercel cuidará automaticamente de:
- Servir os arquivos estáticos (fotos, vídeos, scripts, fontes) via CDN global ultra-rápida.
- Roteamento das rotas `/api/*` para a Serverless Function (`api/index.ts`).
- Roteamento SPA para todas as páginas e produtos (`index.html`).

---

## 📂 Estrutura de Arquivos Estáticos e Vídeos
- `/videos/bem-garota-desktop.mp4` e `/videos/bem-garota-mobile.mp4` ficam na pasta `public/videos/`.
- No build do Vite, a pasta `public/` é copiada automaticamente para `dist/`.
- O servidor Express (`server.ts`) e a função serverless (`api/index.ts`) contêm suporte nativo a requisições com cabeçalho `Range` (HTTP 206 Partial Content) para reprodução fluida em todos os navegadores e celulares.
