# Evolve AI v0.5 — pesquisa web mais rápida e abrangente

Esta versão corrige os dois problemas observados na v0.4: respostas factuais que diziam não ter informação e demora excessiva antes da resposta.

## O que mudou

- Pesquisa web automática em toda pergunta.
- Provedores executados em paralelo, em vez de esperar um por um.
- Bing RSS sem chave como fonte adicional de resultados gerais.
- SearXNG, Wikipedia, DuckDuckGo e GDELT como fontes complementares/fallback.
- Duas variações da consulta para melhorar perguntas factuais curtas.
- Cache de pesquisas recentes no Worker.
- Leitura rápida de páginas somente quando os snippets são insuficientes ou a pergunta é muito atual.
- O modelo deve responder por melhor esforço mesmo quando a busca não consegue confirmar tudo, sem inventar fontes.
- Fallback para Llama Fast se o modelo principal falhar.
- Conversas existentes são preservadas porque a chave de armazenamento do navegador não mudou.

## Atualização

Envie/substitua no repositório GitHub:

- `public/`
- `src/`
- `package.json`
- `wrangler.jsonc`
- `README.md`

O Cloudflare deve fazer o deploy automaticamente depois do commit.

## Observação sobre custo zero

A aplicação continua sem API paga externa. Ela usa a franquia gratuita do Cloudflare Workers AI enquanto houver cota disponível. Quando o projeto for monetizado, uma API oficial de busca comercial ou uma infraestrutura própria de pesquisa será a evolução recomendada para aumentar confiabilidade e escala.
