# Banco de dados

## Tecnologia

O sistema usa MySQL 8.4 com Prisma 7 e o adapter MariaDB/MySQL. A URL de conexão fica exclusivamente em `DATABASE_URL`.

## Entidades

- `AdminUser`, `AdminSession` e `PasswordResetToken`: usuários e autenticação do ADM.
- `Package`, `PackageCategory` e `Destination`: catálogo e classificação.
- `PackageMedia`, `PackageIncludedItem`, `PackageExcludedItem` e `ItineraryItem`: conteúdo detalhado dos pacotes.
- `Lead`: contatos do formulário, WhatsApp e lista de espera.
- `Testimonial`, `Faq` e `GalleryItem`: conteúdo editorial.
- `CompanySettings`: configurações únicas da D’Hages.
- `AuditLog`: trilha das operações administrativas relevantes.

## Instalação

Configure o `.env` e execute:

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
```

Em desenvolvimento, uma nova migration pode ser criada com:

```bash
npm run db:migrate -- --name nome_da_alteracao
```

Não use `prisma migrate dev` diretamente em produção. Produção deve executar apenas `npm run db:deploy` sobre um backup recente.

## Seed

O seed cria ou atualiza:

- usuário administrador inicial;
- configurações da empresa;
- categorias e destinos;
- cinco pacotes demonstrativos publicados;
- mídias, perguntas frequentes e depoimento inicial.

Defina `ADMIN_INITIAL_PASSWORD` em produção. Sem essa variável, uma senha aleatória é gravada em `storage/dev-admin-credentials.txt`; esse comportamento é destinado ao desenvolvimento local. O seed atualiza a senha do administrador inicial a cada execução.

## Backup e restauração

Inclua no plano de backup:

- dump diário do banco MySQL;
- cópia do diretório configurado em `UPLOAD_DIR`;
- retenção com ao menos uma cópia fora do servidor;
- teste periódico de restauração em ambiente separado.

Banco e uploads devem ser restaurados juntos para manter as referências de mídia consistentes.
