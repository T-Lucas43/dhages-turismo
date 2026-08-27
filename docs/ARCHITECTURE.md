# Arquitetura

## Visão geral

A aplicação usa o App Router do Next.js. Páginas públicas e administrativas são renderizadas no servidor; componentes interativos usam Client Components somente onde necessário. O sistema completo roda como uma única aplicação Node.js conectada ao MySQL.

## Camadas

- `src/app`: rotas públicas, painel ADM e Route Handlers da API.
- `src/components`: layout público, busca, cards, formulários e componentes administrativos.
- `src/lib/public-data.ts`: leitura pública; usa MySQL no modo completo e dados demonstrativos no modo frontend-only.
- `src/lib/admin`: regras de negócio e auditoria do painel.
- `src/lib/auth`: criação e validação das sessões administrativas.
- `src/lib/storage`: contrato de armazenamento e implementação local persistente.
- `src/lib/validation`: schemas Zod usados nas fronteiras da aplicação.
- `prisma`: schema, migrations e seed.

## Fluxos principais

### Site público

1. A rota consulta somente pacotes publicados, não arquivados e dentro da janela de publicação.
2. O servidor entrega HTML com metadata e conteúdo inicial.
3. Filtros do catálogo atualizam a URL e a lista visível.
4. Ações de contato criam leads no modo completo ou abrem o WhatsApp no deploy frontend-only.

### Painel administrativo

1. O login verifica a senha com Argon2id.
2. Uma sessão opaca e um token CSRF são persistidos e enviados por cookies.
3. O layout ADM exige uma sessão válida antes de consultar ou renderizar dados.
4. Operações mutáveis passam por validação, autorização, CSRF e registro de auditoria.

### Mídia

1. O navegador envia vários arquivos no mesmo formulário.
2. O servidor valida o tipo real e o limite de bytes.
3. Imagens são rotacionadas conforme EXIF, limitadas a 1920 px e convertidas para WebP; uma miniatura 640×420 também é criada.
4. Vídeos MP4, WebM ou MOV são preservados e recebem um poster WebP.
5. O ADM define uma mídia de capa e uma de prévia; o catálogo reproduz a prévia no hover quando disponível.

## Modos de implantação

- Completo: `FRONTEND_ONLY=0`, MySQL e diretório persistente de uploads obrigatórios.
- Vitrine Vercel: `FRONTEND_ONLY=1`; ADM, APIs e uploads respondem 404, e os dados públicos vêm do catálogo demonstrativo empacotado.

O modo frontend-only não substitui o backend de produção. Ele existe para publicar uma vitrine pública isolada, conforme o escopo do deploy na Vercel.
