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

| Método | Rota                 | Descrição                             |
| ------ | -------------------- | ------------------------------------- |
| GET    | `/conversations`     | Lista todas as conversas              |
| POST   | `/conversations`     | Cria uma nova conversa                |
| GET    | `/conversations/:id` | Busca conversa por ID (com mensagens) |
| DELETE | `/conversations/:id` | Remove uma conversa                   |

**POST `/conversations`** — Body:

```json
{ "title": "Minha conversa" }
```

### Mensagens

| Método | Rota                                 | Descrição                              |
| ------ | ------------------------------------ | -------------------------------------- |
| GET    | `/conversations/:id/messages`        | Lista mensagens de uma conversa        |
| GET    | `/conversations/:id/messages/:msgId` | Busca mensagem específica por ID       |
| POST   | `/conversations/:id/messages`        | Envia mensagem e recebe resposta da IA |

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

> **Nota**: As ferramentas se conectam a uma API de mock de produtos e pedidos rodando em `http://localhost:3333`. Essa API precisa estar rodando separadamente para que o assistente consiga consultar produtos, criar pedidos etc.

## Exemplos de conversa

> _Espaço reservado para prints ou blocos de texto de conversas testadas com o assistente._

Abaixo, um exemplo textual de interação com a Aurora via API:

**Requisição:**

```bash
curl -X POST http://localhost:3000/conversations \
  -H "Content-Type: application/json" \
  -d '{"title": "Quero comprar um tênis"}'
```

**Resposta:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Quero comprar um tênis",
  "createdAt": "2026-05-05T...",
  "updatedAt": "2026-05-05T..."
}
```

**Enviando mensagem 1:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "Quais produtos vocês têm disponíveis?"}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Aqui estão os produtos disponíveis no momento:\n\n| Nº | Nome | Preço (R$) | Estoque |\n|---|------|------------|----------|\n| 1 | Camiseta Farm Estampada | 89,90 | 50 |\n| 2 | Vestido Midi Farm Floral | 199,90 | 30 |\n| 3 | Tênis Fila Branco Casual | 299,90 | 40 |\n| 4 | Sandália Havaianas Power | 79,90 | 100 |\n| 5 | Bolsa de Ráfia Verão | 129,90 | 25 |\n| 6 | Chapéu de Ráfia Natural | 89,90 | 35 |\n| 7 | Óculos Sol Redondo Degradê | 149,90 | 60 |\n| 8 | Brinco Grande Resina Flor | 49,90 | 80 |\n| 9 | Broche Colorido Lapela | 39,90 | 0 (indisponível) |\n| 10 | Short Jeans com Franjas | 159,90 | 0 (indisponível) |\n\nSe quiser mais detalhes de algum item ou iniciar a compra, é só me avisar!"
    }
  ]
}
```

**Enviando mensagem 2:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "Me mostra só os produtos que estão em estoque."}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Segue apenas a lista dos produtos que ainda têm estoque disponível:\n\n| Nº | Nome | Preço (R$) | Quantidade em estoque |\n|---|------|------------|------------------------|\n| 1 | Camiseta Farm Estampada | 89,90 | 50 |\n| 2 | Vestido Midi Farm Floral | 199,90 | 30 |\n| 3 | Tênis Fila Branco Casual | 299,90 | 40 |\n| 4 | Sandália Havaianas Power | 79,90 | 100 |\n| 5 | Bolsa de Ráfia Verão | 129,90 | 25 |\n| 6 | Chapéu de Ráfia Natural | 89,90 | 35 |\n| 7 | Óculos Sol Redondo Degradê | 149,90 | 60 |\n| 8 | Brinco Grande Resina Flor | 49,90 | 80 |\n\nCaso queira ver mais detalhes de algum desses itens ou iniciar a compra, é só me dizer!"
    },
    {
      "type": "reasoning",
      "text": "We need to filter list to those with stock >0. We have the list already; we can just respond with those. Provide same table excluding items with stock 0."
    }
  ]
}
```

**Enviando mensagem 3:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text":  "Me conta mais sobre o produto 3."}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "**Tênis Fila Branco Casual**\n\n- **ID:** `bca8b96d-96f7-4056-acf2-5694954225b5`  \n- **Preço:** R$ 299,90  \n- **Estoque disponível:** 40 unidades  \n- **Imagem:** ![Imagem do produto](https://pplx-res.cloudinary.com/image/upload/pplx_search_images/bf5bc1c16a19cb3699c9af3647c6abefd29e854f.jpg)\n\nDescrição resumida: Tênis da marca Fila, modelo casual, cor branca, ideal para combinar com looks do dia a dia. Confortável e com design clássico.\n\nSe quiser saber mais detalhes, comparar com outro modelo ou já iniciar a compra, é só avisar!"
    }
  ]
}
```

**Enviando mensagem 4:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text":  "E quanto custa o produto 2?"}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "O **Vestido Midi Farm Floral** custa **R$ 199,90**.  \n\nSe precisar de mais informações, fotos maiores ou quiser incluir este item em um pedido, é só me avisar!"
    }
  ]
}
```

**Enviando mensagem 5:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text":  "Quero comprar 2 unidades do produto 1 e 1 unidade do produto 4."}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Ótimo! Você quer comprar:\n\n- **2 × Camiseta Farm Estampada** (R$ 89,90 cada)  \n- **1 × Sandália Havaianas Power** (R$ 79,90)\n\n**Valor total:** R$ 259,70  \n\nPosso criar o pedido agora? Basta confirmar que está tudo certo."
    },
    {
      "type": "reasoning",
      "text": "User repeats request. Need to confirm items and check stock before creating order.\n\nProduct 1: Camiseta Farm Estampada, id ed2c933a-205b-4aa3-918b-388b9aac90b2, stock 50, price 89.9.\n\nProduct 4: Sandália Havaianas Power, id e8e29aa7-0282-4e91-b9c7-e4572c152d09, stock 100, price 79.9.\n\nQuantities: 2 of product1, 1 of product4. Stock sufficient.\n\nWe should confirm with user before creating order. The user is explicit, but we can still confirm: \"Você deseja 2 Camiseta Farm Estampada e 1 Sandália Havaianas Power, total ...?\" Then ask confirmation. Since they are explicit, we might proceed, but best practice is to confirm total. Let's compute total: 2 * 89.9 = 179.8; + 79.9 = 259.7. So total 259.70.\n\nWe'll ask for confirmation."
    }
  ]
}
```

**Enviando mensagem 6:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text":  "Faça o pedido"}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "✅ **Pedido criado com sucesso!**\n\n- **ID do pedido:** `541a5d95-56e9-44c2-a3e0-34b19686dd5b`  \n- **Itens:**  \n  1. Camiseta Farm Estampada – 2 unidades (R$ 89,90 cada) – Subtotal: R$ 179,80  \n  2. Sandália Havaianas Power – 1 unidade (R$ 79,90) – Subtotal: R$ 79,90  \n- **Valor total:** **R$ 259,70**  \n- **Status:** pending (em andamento)\n\nSe precisar acompanhar o status ou tiver outra dúvida, é só chamar!"
    }
  ]
}
```

**Enviando mensagem 7:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "Adiciona também 3 unidades do último que você me mostrou."}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "No momento não disponho de uma operação para **alterar** um pedido já criado. Para incluir as 3 unidades do último produto (Sandália Havaianas Power) é necessário gerar um **novo** pedido.\n\nPosso criar um novo pedido com:\n- 2 × Camiseta Farm Estampada  \n- 1 × Sandália Havaianas Power (do pedido anterior)  \n- **+ 3 × Sandália Havaianas Power** (adição solicitada)\n\nO total ficaria **R$ 339,50** (R$ 259,70 do primeiro pedido + 3 × 79,90).  \nDeseja que eu proceda com esse novo pedido?"
    },
    {
      "type": "reasoning",
      "text": "The user says \"Adiciona também 3 unidades do último que você me mostrou.\" The last product shown in the order details list is Sandália Havaianas Power (the last item in the order). However, \"último que você me mostrou\" could refer to the last product shown in previous messages. The last product shown before this request was the order confirmation with items, where the last item listed is Sandália Havaianas Power. So they want to add 3 units of Sandália Havaianas Power.\n\nWe need to update the order: but we have no tool to modify orders. The allowed tools are get_product, list_products, create_order, get_order_status. No edit order. According to business rules, we cannot cancel or edit orders. So we must inform the user that editing a order is not available.\n\nWe can suggest creating a new order including the additional items. We need to ask if they want to create a new order with the original items plus the extra 3 units, or cancel previous and create new. Since we cannot modify, we must say operation not available.\n\nThus respond: cannot add to existing order, need to create new order. Offer to create new order."
    }
  ]
}
```

**Enviando mensagem 8:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text":  "Qual o status do pedido ja realizado?"}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "✅ **Status do pedido 541a5d95-56e9-44c2-a3e0-34b19686dd5b**\n\n- **Status atual:** **pending** (em andamento)  \n- **Itens do pedido:**  \n  1. Sandália Havaianas Power – 1 unidade – Subtotal: R$ 79,90  \n  2. Camiseta Farm Estampada – 2 unidades – Subtotal: R$ 179,80  \n- **Valor total:** R$ 259,70  \n- **Criado em:** 05/05/2026 23:59:43  \n\nSe precisar de mais alguma coisa (como acompanhar a entrega ou criar um novo pedido), é só me chamar!"
    }
  ]
}
```

**Enviando mensagem 9:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text":  "Me fala do produto 999."}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Desculpe, não localizei nenhum produto com o identificador **999** no nosso catálogo. Posso ajudar a encontrar outro item ou esclarecer alguma dúvida sobre os produtos disponíveis."
    },
    {
      "type": "reasoning",
      "text": "Product ID 999 does not exist. Need to respond that product not found, offer help."
    }
  ]
}
```

**Enviando mensagem 10:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text":  "Quero comprar 1000 unidades do produto 1."}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Infelizmente não temos estoque suficiente para atender a quantidade solicitada.\n\n- **Produto:** Camiseta Farm Estampada  \n- **Estoque disponível:** 50 unidades  \n\nVocê gostaria de comprar até 50 unidades ou escolher outro produto/quantidade? Estou à disposição para ajudar!"
    },
    {
      "type": "reasoning",
      "text": "We need to check product 1 stock: Camiseta Farm Estampada, stock 50. 1000 exceeds stock. Must inform limitation and not create order.\n\n"
    }
  ]
}
```

**Enviando mensagem 11:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text":  "Qual o status do pedido 9999?"}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Não encontrei nenhum pedido com o ID **9999**. Se o número estiver incorreto ou precisar de ajuda com outro pedido, por favor, me avise!"
    },
    {
      "type": "reasoning",
      "text": "Order ID 9999 does not exist. Must respond that not found."
    }
  ]
}
```

**Enviando mensagem 12:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text":  "Qual a previsão do tempo em SP?"}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Desculpe, meu foco é ajudar apenas com informações sobre os produtos e pedidos da loja. Se precisar de algo relacionado a compras, estou à disposição!"
    },
    {
      "type": "reasoning",
      "text": "User asks weather, which is out of scope. Must respond that we only help with store."
    }
  ]
}
```

**Enviando mensagem 13:**

```bash
curl -X POST http://localhost:3000/conversations/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Content-Type: application/json" \
  -d '{"text":  "Cancela meu pedido anterior"}'
```

**Resposta:**

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "No momento não temos a funcionalidade de **cancelamento** de pedidos disponível. Se precisar de outra assistência — como criar um novo pedido ou consultar o status de outro — estou aqui para ajudar!"
    },
    {
      "type": "reasoning",
      "text": "User wants to cancel order, which is not supported. Must inform operation not available."
    }
  ]
}
```

---

## Decisões técnicas

### Framework — Fastify

Escolhi o **Fastify** pela ótima performance, fácil desenvolvimento e também porque implementa bem com typescript.

### LLM — Groq (`openai/gpt-oss-120b`)

Usei o **Groq** como provedor de inferência por:

- Ser gratuito e fácil de configurar (basta uma chave de API)
- Oferecer modelos com boa qualidade para tarefas em português
- O modelo `openai/gpt-oss-120b` ter um bom custo-benefício entre qualidade e latência

> A escolha do modelo é facilmente substituível mudando apenas o provider/model no arquivo `ai-service.ts`.

### Vercel AI SDK com ferramentas (tools)

Adotei o **Vercel AI SDK** (`ai`) porque ele fornece:

- Abstração limpa sobre diferentes provedores de LLM
- Suporte nativo a **tools** (function calling) com schema Zod
- Controle de fluxo com `maxSteps`, `stopWhen`, `maxRetries`
- Histórico de mensagens tipado (`ModelMessage[]`)

Isso me permitiu estruturar o **agente** de forma declarativa: as tools são funções separadas com schema de entrada (Zod) e descrição em português, e o próprio modelo decide quando e como chamá-las.

### Estrutura do agente

O agente segue uma arquitetura simples:

1. **System prompt** em português definindo personalidade, regras de negócio e escopo
2. **Tools** independentes e auto-descritivas (`list_products`, `get_product`, `create_order`, `get_order_status`)
3. **Repositórios** para persistência de conversas e mensagens
4. **Controllers** como camada fina de validação (Zod) e orquestração

O modelo recebe o histórico completo da conversa a cada chamada, permitindo que ele entenda contexto e referências.

### Banco — Knex + SQLite

SQLite com Knex foi escolhido para manter a stack leve e sem necessidade de infraestrutura externa. O Knex abstrai o banco e permitiria migrar para Postgres ou MySQL com mínimo esforço.

### O que foi deixado de fora de propósito

- **Autenticação/autorização**: não há controle de usuários; a API é propositalmente aberta para facilitar testes
- **Streaming de respostas**: o Vercel AI SDK suporta streaming, mas optei por resposta completa (sem streaming) para simplificar a integração
- **Migrations e seeds do Knex**: usei scripts diretos em vez do sistema oficial de migrations para manter a configuração mais enxuta

---

## O que melhoraria com mais tempo

- **Migrations & seeds** via Knex (`knex migrate:make` / `knex seed:run`) em vez de scripts avulsos
- **Substituir SQLite por Postgres** para dados mais robustos e concorrência real
- **Testes**: unitários (controllers, repositórios) e de integração (endpoints) com Vitest + supertest
- **Streaming** das respostas da IA para melhor experiência do usuário
- **Documentação OpenAPI / Swagger** com exemplos interativos
- **Schemas de validação mais completos** e centralizados, com contrato explícito de respostas

---

## Scripts disponíveis

| Script          | Descrição                                     |
| --------------- | --------------------------------------------- |
| `yarn dev`      | Inicia em modo desenvolvimento com hot-reload |
| `yarn build:ts` | Compila TypeScript                            |
| `yarn start`    | Inicia servidor em produção                   |
| `yarn setup`    | Cria as tabelas no banco SQLite               |
