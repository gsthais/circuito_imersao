# Circuito TransformaGOV

Painel de organização do Circuito TransformaGOV 2026, com sete etapas e 54 tarefas.

## Uso

Site estático em HTML, CSS e JavaScript, sem instalação ou etapa de build. Abra `index.html` no navegador ou sirva esta pasta com um servidor estático.

- Navegação por etapa e visualização de todas as tarefas.
- Busca, filtros, contadores e progresso geral.
- Marcações salvas automaticamente no `localStorage`, com a chave `transformagov-checklist`.
- Exportação do checklist em TXT com as marcações atuais.
- Interface adaptada ao celular, com seletor de etapas.

As marcações pertencem ao navegador e à origem do site. Não são sincronizadas entre dispositivos ou pessoas. A limpeza dos dados do site remove o progresso local. A exportação permite guardar uma cópia.

## Arquivos

- `index.html`: estrutura e interface.
- `style.css`: layout, estilos e responsividade.
- `app.js`: navegação, filtros, persistência e exportação.
- `data.js`: conteúdo do checklist.
- `assets/`: fontes Manrope e licença SIL Open Font License.
- `vercel.json`: publicação estática no Vercel, sem dependências de build.

## Validação

Interface verificada em 1440, 768, 390 e 320 px. Fluxos de marcação, recuperação após recarregar e abrir nova aba, filtros, busca, exportação e navegação entre etapas verificados em Chromium.
