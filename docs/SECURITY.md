# Segurança

## Controles implementados

- Senhas administrativas com Argon2id.
- Mensagem de login genérica para evitar enumeração de usuários.
- Custo de hash também aplicado quando o e-mail não existe.
- Bloqueio temporário após cinco senhas inválidas.
- Sessões opacas persistidas apenas como hash no MySQL.
- Cookie de sessão `HttpOnly`, `SameSite=Strict`, seguro em produção e com validade de sete dias.
- Token CSRF separado para operações administrativas mutáveis.
- Verificação de usuário ativo em todas as sessões.
- Validação Zod nos dados recebidos.
- Detecção do tipo real de arquivos e limites de tamanho.
- Resolução segura dos caminhos de upload contra travessia de diretório.
- Headers contra MIME sniffing, framing e permissões desnecessárias.
- Registro de auditoria para operações administrativas relevantes.

## Segredos

Nunca versione:

- `.env`;
- senha inicial do administrador;
- `SESSION_SECRET`;
- dump do banco;
- conteúdo de `storage/mysql-data`;
- `storage/dev-admin-credentials.txt`.

Use uma `SESSION_SECRET` aleatória com pelo menos 32 caracteres e credenciais diferentes por ambiente. Troque imediatamente qualquer segredo exposto.

## Produção

- Use HTTPS obrigatório.
- Restrinja o MySQL à rede privada ou ao host da aplicação.
- Dê ao usuário do banco somente as permissões necessárias no schema da aplicação.
- Mantenha Node.js, Next.js, Prisma e dependências atualizados após testes.
- Faça backup conjunto do banco e dos uploads.
- Monitore falhas de login, erros 5xx, espaço em disco e crescimento dos uploads.
- Considere proteção adicional no proxy/CDN para `/acesso-administrativo`.

## Limitações operacionais

O armazenamento atual é local. Para múltiplas instâncias, migre a implementação de `StorageProvider` para um serviço de objetos compartilhado. O deploy frontend-only da Vercel não expõe ADM, APIs nem uploads e não deve ser usado como backend.
