# Bem Garota — Loja Virtual

Projeto da loja virtual Bem Garota com vitrine de produtos, categorias, busca, filtros, carrinho e painel administrativo.

## Tecnologias

- React 19 + TypeScript
- Vite + Tailwind CSS
- Node.js + Express
- Persistência local em JSON (`data/store-db.json`)

## Executar localmente

1. Instale o Node.js.
2. Instale as dependências com `npm install`.
3. Configure as variáveis necessárias a partir de `.env.example`, se for utilizar os recursos de integração.
4. Execute `npm run dev`.
5. Acesse o endereço local exibido no terminal.

## Catálogo inicial

O catálogo inicial da Bem Garota inclui 13 publicações e 30 fotografias em `public/products/catalogo-bem-garota/`. Cada publicação mantém sua própria galeria e preço inicial de R$ 10,00.

Os tamanhos e o estoque não foram presumidos. Os produtos entram com estoque não controlado até que a loja informe os dados reais no painel administrativo. Ao informar estoque, o controle passa a ser aplicado normalmente.

## Administração

O painel administrativo existente gerencia produtos, imagens da galeria (envio de JPG, PNG ou WEBP de até 8 MB por foto, além de caminhos/URLs), preços, categorias, tamanhos, estoque e status. As imagens enviadas ficam em `public/uploads/products/`. Os dados da loja são persistidos no arquivo JSON do servidor.
