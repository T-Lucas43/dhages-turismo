# Deploy completo na Hostinger

Este roteiro é para uma hospedagem Hostinger que suporte aplicação Node.js persistente e MySQL. Em hospedagem compartilhada sem processo Node.js, use um VPS ou plano compatível.

## 1. Preparar a infraestrutura

1. Crie um banco MySQL e um usuário exclusivo.
2. Restrinja o acesso ao banco ao servidor da aplicação.
3. Configure um domínio ou subdomínio com HTTPS.
4. Reserve um diretório persistente para uploads, fora de pastas apagadas durante cada deploy.
5. Instale Node.js 20 ou superior e um gerenciador de processos, como PM2, quando estiver em VPS.

## 2. Variáveis de ambiente

Configure no painel ou no serviço do processo:

```text
NODE_ENV=production
DATABASE_URL=mysql://usuario:senha@host:3306/banco
SESSION_SECRET=uma-chave-aleatoria-com-ao-menos-32-caracteres
APP_URL=https://seudominio.com.br
UPLOAD_DIR=/caminho/persistente/dhages-uploads
UPLOAD_BASE_URL=/uploads
MAX_IMAGE_UPLOAD_BYTES=10485760
MAX_VIDEO_UPLOAD_BYTES=104857600
FRONTEND_ONLY=0
ADMIN_INITIAL_NAME=Administrador D'Hages
ADMIN_INITIAL_EMAIL=seu-email-administrativo
ADMIN_INITIAL_PASSWORD=uma-senha-forte-e-exclusiva
```

Não coloque o arquivo `.env` dentro de `public` e não o envie ao GitHub.

## 3. Instalar e preparar

No diretório da aplicação:

```bash
npm ci
npm run db:generate
npm run db:deploy
npm run db:seed
npm run build
```

Depois do primeiro seed, remova `ADMIN_INITIAL_PASSWORD` do ambiente de execução se o painel da hospedagem permitir separar variáveis de tarefa e runtime. Não execute o seed automaticamente em todo deploy, pois ele redefine a senha inicial.

## 4. Iniciar

Com o painel de aplicações Node.js, use:

```text
npm run start
```

Em VPS com PM2:

```bash
pm2 start npm --name dhages-turismo -- start
pm2 save
pm2 startup
```

O proxy reverso deve encaminhar o domínio para a porta interna da aplicação e permitir requisições de upload até o limite configurado.

## 5. Persistência de uploads

`UPLOAD_DIR` precisa sobreviver a reinícios e novos releases. Dê permissão de leitura e escrita somente ao usuário do processo Node.js. Inclua esse diretório no backup diário junto com o MySQL.

Se a aplicação for escalada para mais de uma instância, substitua o armazenamento local por um provedor de objetos compartilhado antes de escalar.

## 6. Verificação pós-deploy

1. Abra `/`, `/pacotes`, um detalhe de pacote, `/destinos`, `/sobre` e `/contato`.
2. Confirme HTTPS, sitemap e robots.
3. Faça login em `/acesso-administrativo`.
4. Crie um pacote de teste em rascunho.
5. Envie duas imagens e um vídeo 1920×1080.
6. Defina capa e prévia, publique e confira o site público.
7. Envie um lead de teste e atualize o status no ADM.
8. Arquive e exclua os registros de teste.
9. Confirme logs, backup e espaço em disco.

## 7. Atualizações

Antes de cada atualização, faça backup e execute:

```bash
git pull --ff-only
npm ci
npm run db:generate
npm run db:deploy
npm run build
pm2 restart dhages-turismo
```

Adapte o último comando ao gerenciador de processo da sua hospedagem. Após reiniciar, repita ao menos a verificação da página inicial, do login e de uma operação de leitura no painel.
