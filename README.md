# PayFlow — Frontend de demonstração

Protótipo de frontend de um sistema de pagamentos (conta digital, Pix,
cartão 3 em 1 e microcrédito), inspirado no modelo de negócio da Cactvs
Instituição de Pagamento, feito para apresentação em entrevista.

> Login, cadastro, saldo, extrato e Pix são **reais**: falam com o backend
> NestJS (`../backend`, repo `PayFlow-api`) via `src/api/client.js`. Toda regra
> financeira (saldo suficiente, idempotência, destino ≠ origem) vive no backend.
> **Cartão e microcrédito** continuam mockados (`src/data/mockData.js`) — não
> há módulo para eles no backend.

## Rodando localmente

1. Suba o backend (`../backend`): `npm run start:dev` → `http://localhost:3000`
   (Swagger em `/docs`). Na primeira vez: `db:generate`, `db:migrate`, `db:seed`.
2. No frontend:

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Contas de teste (criadas pelo seed do backend)

| Email | Senha | CPF (chave Pix) |
|---|---|---|
| ana@email.com | senha1234 | 111.444.777-35 |
| bruno@email.com | senha1234 | 123.456.789-09 |

O login já vem preenchido com a Ana. Faça um Pix para o CPF do Bruno.
Também dá para criar conta nova em `/cadastro` (CPF precisa ser válido).

## Idempotência do Pix

Cada tentativa de transferência gera uma `idempotencyKey` no cliente
(`src/utils/idempotencia.js`). Se a rede cair ou o backend responder
`TRANSACAO_EM_PROCESSAMENTO`, o reenvio usa a **mesma** chave — o servidor
reconhece e nunca debita duas vezes. Mudar destino/valor, ou um erro
definitivo, gera uma chave nova.

## Estrutura

```
src/
  api/
    client.js            # cliente HTTP único: base URL, Bearer token, erros, 401
  utils/
    cpf.js               # validação/máscara de CPF (mesma regra do backend)
    idempotencia.js      # gera idempotencyKey do Pix
  context/
    AuthContext.jsx      # login/cadastro reais, token JWT em localStorage
    WalletContext.jsx    # saldo e extrato da API, envio de Pix
  data/
    mockData.js          # só cartão e microcrédito (sem backend)
  components/
    DashboardShell.jsx    # layout com sidebar do app logado
    ProtectedRoute.jsx    # bloqueia rotas /app/* sem login
  pages/
    Landing.jsx            # landing page de apresentação (marketing)
    Login.jsx               # tela de login (baseada no mockup fornecido)
    Dashboard.jsx           # visão geral: saldo, gráfico, movimentações
    Cadastro.jsx             # abertura de conta
    Pix.jsx                  # formulário de transferência Pix
    Cartao.jsx               # cartão virtual, bloqueio, dados
    Extrato.jsx              # extrato completo com filtros e busca
```

## Rotas

| Rota | Descrição |
|---|---|
| `/` | Landing page |
| `/login` | Autenticação (`POST /api/auth/login`) |
| `/cadastro` | Abrir conta (`POST /api/auth/register`) |
| `/app` | Dashboard (protegida) |
| `/app/pix` | Transferências Pix (protegida) |
| `/app/cartao` | Cartão (protegida) |
| `/app/extrato` | Extrato (protegida) |

## Build de produção

```bash
npm run build
npm run preview
```
