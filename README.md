# Aurora AI

API de chatbot com Inteligência Artificial para assistência virtual de loja online. Construída com **Fastify + TypeScript + Knex (SQLite) + Groq AI + Vercel AI SDK**.

## Funcionalidades

- **Conversas**: CRUD completo de conversas (criar, listar, buscar, atualizar título, deletar)
- **Mensagens**: envio de mensagens com resposta automática gerada por IA
- **Assistente virtual** especializado em loja online (consulta de produtos, verificação de estoque, criação de pedidos)
- **Ferramentas (tools)**: o modelo de IA pode executar ações como listar produtos, consultar detalhes, criar pedidos e verificar status
- **Validação** de entrada com Zod

## Requisitos

- Node.js >= 18 LTS
- Yarn ou npm
- Chave de API do [Groq](https://console.groq.com/) (variável de ambiente `GROQ_API_KEY`)

## Estrutura do projeto

```
src/
├── app.ts                          # Configuração principal do Fastify
├── controllers/
│   ├── conversations-controller.ts # Lógica dos endpoints de conversas
│   └── messages-controller.ts      # Lógica dos endpoints de mensagens + IA
├── infra/
│   ├── knex/
│   │   ├── database.ts             # Conexão com SQLite via Knex
│   │   ├── db.sqlite               # Arquivo do banco de dados
│   │   └── schema.ts               # Criação das tabelas (schema)
│   ├── repositories/
│   │   ├── conversations-repository.ts  # Acesso a dados de conversas
│   │   └── messages-repository.ts       # Acesso a dados de mensagens
│   └── services/
│       ├── ai-service.ts           # Integração com Groq + Vercel AI SDK
│       └── tools.ts                # Ferramentas (tools) do modelo de IA
├── plugins/
│   ├── sensible.ts                 # Plugin @fastify/sensible
│   └── support.ts                  # Plugin de suporte (decorator)
└── routes/conversations/
    ├── index.ts                    # Rotas de conversas
    └── messages/
        └── index.ts                # Rotas de mensagens
```

## Como rodar

### 1. Clone e instale dependências

```bash
git clone <repo-url>
cd aurora-ai
yarn install
```

### 2. Configure a chave da API Groq

Crie um arquivo `.env` na raiz do projeto:

```bash
GROQ_API_KEY=sua_chave_aqui
```

### 3. Inicialize o banco de dados

```bash
yarn setup
```

Isso executa `src/infra/knex/schema.ts` e cria as tabelas `conversations` e `messages` no SQLite.

### 4. Inicie o servidor de desenvolvimento

```bash
yarn dev
```

O servidor inicia por padrão em `http://localhost:3000`.

### Build e produção

```bash
yarn build:ts    # Compila TypeScript para dist/
yarn start       # Inicia o servidor com a versão compilada
```

## Endpoints

### Conversas

| Método | Rota                | Descrição                         |
|--------|---------------------|-----------------------------------|
| GET    | `/conversations`    | Lista todas as conversas          |
| POST   | `/conversations`    | Cria uma nova conversa            |
| GET    | `/conversations/:id` | Busca conversa por ID (com mensagens) |
| DELETE | `/conversations/:id` | Remove uma conversa               |

**POST `/conversations`** — Body:

```json
{ "title": "Minha conversa" }
```

### Mensagens

| Método | Rota                                  | Descrição                                      |
|--------|---------------------------------------|------------------------------------------------|
| GET    | `/conversations/:id/messages`         | Lista mensagens de uma conversa                |
| GET    | `/conversations/:id/messages/:msgId`  | Busca mensagem específica por ID               |
| POST   | `/conversations/:id/messages`         | Envia mensagem e recebe resposta da IA         |

**POST `/conversations/:id/messages`** — Body:

```json
{ "text": "Quais produtos estão disponíveis?" }
```

A resposta inclui o papel (role) e o conteúdo gerado pela IA.

## Assistente virtual

O sistema possui um assistente virtual em **Português** especializado em loja online. Ele utiliza ferramentas (tools) para executar ações em uma API de mock de produtos e pedidos:

- `list_products` — lista todos os produtos disponíveis
- `get_product` — consulta detalhes de um produto por ID
- `create_order` — cria um novo pedido (verifica estoque antes)
- `get_order_status` — consulta o status de um pedido

> **Nota**: As ferramentas se conectam a uma API de mock rodando em `http://localhost:3333`. Certifique-se de que a API de produtos/pedidos esteja rodando para que o assistente funcione completamente.

## Tecnologias

- **[Fastify 5](https://fastify.dev/)** — Framework web rápido e performático
- **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estática
- **[Knex](https://knexjs.org/)** + **[SQLite](https://sqlite.org/)** — Banco de dados e query builder
- **[Groq AI SDK](https://www.npmjs.com/package/@ai-sdk/groq)** — Modelo de linguagem (`openai/gpt-oss-120b`)
- **[Vercel AI SDK](https://sdk.vercel.ai/docs)** — SDK para integração com modelos de IA (gera texto com tools)
- **[Zod](https://zod.dev/)** — Validação de schemas
- **[Fastify Autoload](https://github.com/fastify/fastify-autoload)** — Carregamento automático de plugins e rotas

## Scripts disponíveis

| Script         | Descrição                                         |
|----------------|---------------------------------------------------|
| `yarn dev`     | Inicia em modo desenvolvimento com hot-reload     |
| `yarn build:ts`| Compila TypeScript                                |
| `yarn start`   | Inicia servidor em produção                       |
| `yarn setup`   | Cria as tabelas no banco SQLite                   |
