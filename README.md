# Evolve AI v0.4 — Cloudflare-first

Esta versão remove WebLLM/WebGPU do navegador. O modelo roda no Cloudflare Workers AI usando o binding `AI`, e o site continua hospedado no mesmo Worker.

## Estrutura

- `public/`: interface web
- `src/index.js`: API `/api/chat`, `/api/evolve`, `/api/health` e pesquisa web
- `wrangler.jsonc`: Static Assets + Workers AI binding
- `package.json`: Wrangler

## Deploy via GitHub + Cloudflare Workers Builds

1. Substitua o conteúdo do repositório pelos arquivos desta versão.
2. No Cloudflare: Settings > Builds.
3. Build command: deixe vazio.
4. Deploy command: `npx wrangler deploy`.
5. Root directory: vazio/raiz.
6. Faça novo commit na branch `main` ou use Retry deployment.

O `wrangler.jsonc` cria o binding `AI` para `env.AI` no Worker.

## Custo

A aplicação usa o plano gratuito do Cloudflare Workers AI enquanto houver cota gratuita disponível. No plano Workers Free, quando a cota gratuita diária é excedida, novas inferências falham em vez de gerar cobrança automática; para exceder a cota é necessário aderir ao plano pago.
