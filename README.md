# Evolve AI v0.3 — gratuita, online e browser-first

Esta versão foi desenhada para **não cobrar por token ou mensagem**.

## Arquitetura

- **Interface:** HTML/CSS/JavaScript estático.
- **Modelo de IA:** WebLLM, executado no navegador via WebGPU.
- **Busca:** Cloudflare Pages Function gratuita, com SearXNG e fallbacks públicos (Wikipedia, DuckDuckGo Instant Answer e GDELT).
- **Memória:** localStorage no navegador.
- **Autoevolução:** o próprio modelo analisa interações, feedback e princípios existentes e pode acrescentar um novo princípio e/ou memória.
- **Hospedagem indicada:** Cloudflare Pages Free.

## O que significa "online sem custo"

O site fica online e pode ser acessado de qualquer lugar. O processamento pesado do modelo ocorre no dispositivo de quem abre o site. Isso evita uma conta de GPU no servidor e cobrança por tokens.

Na primeira utilização, o navegador baixa o modelo selecionado. O download pode ter centenas de MB ou alguns GB e fica em cache. É necessário navegador com WebGPU, preferencialmente Chrome ou Edge recente.

## Pesquisa na internet

A função `/api/search` tenta uma metabusca SearXNG. Como instâncias públicas podem limitar JSON ou ficar indisponíveis, existem fallbacks. Se nenhuma busca funcionar, a interface ainda permite que o modelo responda, mas ele deve informar que não obteve fontes web naquela execução.

## Deploy recomendado (Cloudflare Pages + GitHub)

1. Crie um repositório no GitHub e envie todo o conteúdo desta pasta, mantendo a pasta `functions`.
2. Na Cloudflare, abra **Workers & Pages > Create > Pages > Connect to Git**.
3. Selecione o repositório.
4. Framework preset: **None**.
5. Build command: deixe vazio.
6. Build output directory: `public`.
7. Faça o deploy.
8. Abra a URL `*.pages.dev` gerada.

A pasta `functions/api/search.js` vira automaticamente o endpoint `/api/search` no Cloudflare Pages.

## Limitações reais da v0.3

- A qualidade não é equivalente a Claude/GPT de grande porte: modelos que cabem no navegador são menores.
- A velocidade depende da GPU/memória do computador ou dispositivo do visitante.
- WebGPU não funciona em todo navegador/dispositivo.
- A memória ainda é por navegador/dispositivo, não centralizada entre usuários.
- A pesquisa gratuita depende de serviços públicos que podem ficar temporariamente indisponíveis.
- "Autoevolução" altera memória e princípios, não os pesos neurais do modelo nem o código executável.

## Próximas etapas quando houver receita

A arquitetura foi preparada para trocar gradualmente componentes: banco de dados centralizado, autenticação, modelo maior em servidor, busca dedicada, embeddings/RAG, agentes e sandbox de desenvolvimento com testes/rollback.
