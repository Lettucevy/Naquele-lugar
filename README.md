# 🍜 Naquele Lugar | Izakaya Street Bar

Sistema completo de gestão para um izakaya (bar de rua japonês), com **cardápio digital**, **autoatendimento**, **painel da cozinha** e **administração** de produtos, categorias e pedidos.

---

## Funcionalidades

- **Cardápio digital** — Navegue por categorias, visualize produtos com fotos e adicione ao carrinho
- **Pedidos online** — Finalize pedos com nome e telefone, acompanhe o status em tempo real
- **Rastreamento de pedidos** — Consulte pelo número do pedido ou telefone
- **Painel da cozinha** — Visualize pedidos pendentes e em preparo com atualização automática
- **Painel administrativo** — CRUD de produtos e categorias, atualização de status, estatísticas de vendas
- **Autenticação por papel** — Login com perfis `Admin` e `Cozinha`

---

## Tecnologias

### Frontend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| [Angular](https://angular.dev) | ^19.2.0 | Framework SPA (standalone components) |
| [Angular Router](https://angular.dev/guide/routing) | ^19.2.0 | Roteamento client-side com lazy loading |
| [Angular Forms](https://angular.dev/guide/forms) | ^19.2.0 | Formulários template-driven |
| [Angular HttpClient](https://angular.dev/guide/http) | ^19.2.0 | Comunicação com a API |
| [TypeScript](https://www.typescriptlang.org) | ~5.7.2 | Linguagem |
| [RxJS](https://rxjs.dev) | ~7.8.0 | Programação reativa e Signals |
| [SweetAlert2](https://sweetalert2.github.io) | ^11.26.25 | Modais e alertas |
| [Font Awesome 6](https://fontawesome.com) | CDN | Iconografia |
| [Karma](https://karma-runner.github.io) + [Jasmine](https://jasmine.github.io) | dev | Testes unitários |

### Backend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| [Node.js](https://nodejs.org) | — | Runtime JavaScript |
| [Express](https://expressjs.com) | ^5.2.1 | Framework HTTP / REST API |
| [mssql](https://www.npmjs.com/package/mssql) / [msnodesqlv8](https://www.npmjs.com/package/msnodesqlv8) | ^12.2.1 / ^5.1.9 | Driver Microsoft SQL Server |
| [Multer](https://www.npmjs.com/package/multer) | ^2.1.1 | Upload de imagens de produtos |
| [CORS](https://www.npmjs.com/package/cors) | ^2.8.6 | Middleware de segurança |
| [dotenv](https://www.npmjs.com/package/dotenv) | ^17.4.2 | Gerenciamento de variáveis de ambiente |

### Banco de Dados

| Tecnologia | Detalhes |
|---|---|
| Microsoft SQL Server | Instância local `localhost\SQLEXPRESS` |
| ODBC Driver 17 for SQL Server | Autenticação Windows (`Trusted_Connection=yes`) |

---

## Estrutura do Projeto

```
Naquele lugar/
├── backend/
│   ├── server.js              # Servidor Express (rotas, DB, upload)
│   ├── database.sql           # Schema + dados iniciais
│   ├── init_db_v2.js          # Script de inicialização do banco
│   └── uploads/               # Imagens dos produtos
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # menu, login, admin, kitchen, tracking
│   │   │   ├── services/      # api, auth, cart
│   │   │   └── guards/        # adminGuard, kitchenGuard
│   │   ├── styles.css         # Tema escuro global
│   │   └── index.html
│   ├── angular.json
│   ├── proxy.conf.json        # Proxy p/ API em dev
│   └── package.json
└── README.md
```

---

## Como Executar

### Pré-requisitos

- Node.js 18+
- Angular CLI 19+ (`npm install -g @angular/cli`)
- SQL Server Express com ODBC Driver 17

### 1. Banco de Dados

Execute o script `backend/database.sql` no SQL Server para criar o banco `NaqueleLugarDB`, tabelas e dados iniciais.

### 2. Iniciar aplicação

```bash
cd backend
npm install
node server.js
```

---

## Credenciais Padrão

| Usuário | Senha | Papel |
|---|---|---|
| `naqueleadmin` | `123456` | Admin |
| `naquelecozinha` | `123456` | Cozinha |

---

## API Endpoints

### Públicos
- `GET /api/menu` — Cardápio disponível
- `POST /api/pedidos` — Criar pedido
- `GET /api/tracking/:id` — Rastrear por ID
- `GET /api/tracking/phone/:phone` — Rastrear por telefone

### Autenticação
- `POST /api/login` — Login

### Admin
- `GET/POST/PATCH/DELETE /api/admin/categorias` — CRUD categorias
- `GET/POST/PATCH /api/admin/produtos` — CRUD produtos
- `POST /api/admin/upload` — Upload de imagem
- `GET /api/admin/pedidos` — Listar pedidos
- `PATCH /api/admin/pedidos/:id` — Atualizar status
- `GET /api/admin/stats` — Estatísticas
