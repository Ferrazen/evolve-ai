# Dalva.ai v0.7 — pesquisa multi-fonte e resposta inteligente

Esta versão mantém a arquitetura sem API comercial obrigatória: Cloudflare Workers + Workers AI, dentro da franquia gratuita disponível na conta.

## O que mudou

- Identidade alterada para **Dalva.ai** em toda a interface.
- Correção estrutural do chat: o campo de pergunta agora fica em uma área flexível fixa no rodapé do chat e não deve desaparecer após respostas longas.
- Migração automática das conversas/memórias da versão Evolve armazenadas no navegador.
- Novo roteamento de modelos:
  - GLM 4.7 Flash para tarefas rápidas, planejamento e revisão;
  - Qwen 3.8 27B para respostas factuais/atuais;
  - GPT-OSS 120B para análises e pesquisas mais complexas.
- Pesquisa em múltiplas consultas e múltiplos provedores.
- DuckDuckGo HTML + Bing RSS + SearXNG + Google News + GDELT + Wikipedia.
- Crossref + OpenAlex para pesquisa científica.
- Adaptadores de dados atuais para câmbio e criptomoedas quando a pergunta pede cotação/preço atual.
- Reranking semântico com `@cf/baai/bge-reranker-base`.
- Leitura das páginas mais relevantes, com extração de trechos relacionados à pergunta.
- Jina Reader como fallback de leitura para páginas difíceis em pesquisas profundas, sem chave obrigatória.
- Verificação factual final para perguntas atuais/complexas.
- Indicador de quantidade de fontes, domínios, profundidade, qualidade da evidência e revisão.

## Deploy

O projeto continua compatível com o Worker existente `evolve-ai`, evitando mudar a URL atual.

Suba para a raiz do repositório:

- `public/`
- `src/`
- `package.json`
- `wrangler.jsonc`
- `README.md`

O Cloudflare deverá disparar o deploy automaticamente após o commit.

Depois do deploy, abra o site e use `Ctrl + F5` para limpar o cache da interface.

## Testes sugeridos

1. `Qual o valor do dólar atual em reais e como ele variou hoje?`
2. `Quais são as principais notícias de inteligência artificial hoje? Cruze várias fontes e me diga o que realmente importa.`
3. `Compare as versões mais recentes do ChatGPT e Claude em recursos, usando documentação e fontes recentes.`
4. `Explique as causas de uma alta recente do dólar, separando fatos, contexto e inferências.`
5. Envie uma resposta longa e confirme que o campo **Pergunte qualquer coisa** continua visível no rodapé.

## Observação importante

A v0.7 melhora bastante o processo de pesquisa e síntese, mas uma aplicação gratuita baseada em modelos open-weight e mecanismos públicos de busca não terá garantia de paridade absoluta com GPT/Claude hospedados em infraestrutura proprietária. O projeto está estruturado para trocar os componentes de busca/modelo gradualmente quando houver receita, sem reescrever a interface nem a memória.
