# Evolve AI v0.6 — Pesquisa Inteligente Multi-Fonte

A v0.6 muda a arquitetura de resposta da Evolve. Em vez de pesquisar uma única consulta e entregar os primeiros resultados ao modelo, ela usa um pipeline de apuração e síntese.

## O que mudou

1. **Planejamento da pesquisa** — um modelo rápido transforma a pergunta em até 3 consultas complementares.
2. **Pesquisa paralela** — Bing RSS, SearXNG, Google News, GDELT, DuckDuckGo, Wikipedia e Crossref são consultados conforme o tipo de pergunta.
3. **Ranking de fontes** — resultados recebem pontuação por relevância, autoridade, atualidade e diversidade de domínio.
4. **Leitura das páginas** — a Evolve abre e extrai conteúdo das fontes mais relevantes antes de responder.
5. **Roteamento de modelos** — perguntas simples usam GLM 4.7 Flash; perguntas factuais normais podem usar Gemma 4; perguntas atuais, complexas ou analíticas são encaminhadas ao GPT-OSS 120B.
6. **Verificação final** — respostas de pesquisa profunda passam por uma segunda revisão factual, que verifica citações e remove afirmações sem suporte.
7. **Transparência** — a interface informa quantas fontes e domínios foram consultados e se a resposta passou pela verificação final.
8. **Autoevolução** — feedbacks continuam podendo gerar novos princípios, agora incluindo regras de pesquisa, clareza e qualidade de raciocínio.

## Custo

A aplicação continua usando Cloudflare Workers AI e respeita a franquia gratuita da conta. Modelos mais fortes consomem mais da franquia diária; por isso a v0.6 faz roteamento automático e não usa o modelo mais pesado para perguntas triviais.

## Deploy

Substitua no repositório GitHub os diretórios/arquivos `public`, `src`, `wrangler.jsonc`, `package.json` e `README.md`. O Cloudflare conectado ao repositório fará um novo deploy automaticamente.

Não é necessária chave da OpenAI, Anthropic ou de outro provedor pago.
