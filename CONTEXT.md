# E-commerce Base — CONTEXT.md
> Estrutura técnica reutilizável para lojas de pequenos negócios. Um deploy por cliente.
> A identidade visual (cores, logo, tipografia) é definida diretamente no código para cada cliente — não via variáveis de ambiente.
> Leia este arquivo inteiro antes de gerar qualquer código.

---

## Visão geral

Base de e-commerce para pequenos negócios locais. Cada cliente recebe seu próprio repositório clonado desta base, com identidade visual implementada diretamente no `tailwind.config.ts` e nos componentes. Sem multi-tenancy — uma instância = uma loja.

**Stack:** Next.js 14 (App Router) + Vercel + Neon (PostgreSQL) + NextAuth.js + Mercado Pago Checkout Pro  
**Deploy:** Vercel (repositório único por cliente)  
**Banco:** Neon via `@neondatabase/serverless`  
**Auth:** NextAuth.js com CredentialsProvider (dono da loja — usuário único)  
**Pagamento:** Mercado Pago Checkout Pro (redireciona para página do MP)  
**Carrinho:** estado client-side via `localStorage` + Context API  

## Identidade visual por cliente

Ao clonar para um novo cliente, atualizar diretamente no código:

- **`tailwind.config.ts`** — cores primárias, secundárias e de destaque
- **`app/layout.tsx`** — fonte (Google Fonts), nome da loja no metadata
- **`components/layout/Header.tsx`** — logo e nome da loja
- **`components/layout/Footer.tsx`** — contato, WhatsApp, redes sociais

O design system inteiro parte das cores definidas no Tailwind — trocar 3-4 variáveis ali reflete em toda a aplicação automaticamente.

---

## Estrutura de pastas

```
ecommerce-base/
├── app/
│   ├── layout.tsx                      # Layout raiz com CartProvider
│   ├── page.tsx                        # Home — banner + produtos em destaque
│   ├── produtos/
│   │   ├── page.tsx                    # Catálogo completo com filtros
│   │   └── [slug]/
│   │       └── page.tsx                # Página do produto + variações
│   ├── carrinho/
│   │   └── page.tsx                    # Carrinho + resumo
│   ├── checkout/
│   │   ├── page.tsx                    # Formulário de dados do comprador
│   │   ├── sucesso/
│   │   │   └── page.tsx                # Confirmação pós-pagamento
│   │   └── pendente/
│   │       └── page.tsx                # Pagamento em análise
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── layout.tsx                  # Sidebar admin + proteção de rota
│   │   ├── page.tsx                    # Dashboard — métricas e pedidos recentes
│   │   ├── produtos/
│   │   │   ├── page.tsx                # Lista de produtos
│   │   │   ├── novo/
│   │   │   │   └── page.tsx            # Formulário novo produto
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Editar produto
│   │   ├── categorias/
│   │   │   └── page.tsx
│   │   └── pedidos/
│   │       ├── page.tsx                # Lista de pedidos
│   │       └── [id]/
│   │           └── page.tsx            # Detalhe do pedido
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       ├── products/
│       │   ├── route.ts                # GET — listar produtos públicos
│       │   └── [slug]/
│       │       └── route.ts            # GET — produto com variações
│       ├── categories/
│       │   └── route.ts                # GET — listar categorias
│       ├── checkout/
│       │   └── route.ts                # POST — criar preferência MP
│       ├── webhook/
│       │   └── route.ts                # POST — webhook MP (atualiza status pedido)
│       └── admin/
│           ├── dashboard/
│           │   └── route.ts
│           ├── products/
│           │   ├── route.ts            # GET + POST
│           │   └── [id]/
│           │       └── route.ts        # GET + PATCH + DELETE
│           ├── categories/
│           │   ├── route.ts            # GET + POST
│           │   └── [id]/
│           │       └── route.ts        # PATCH + DELETE
│           └── orders/
│               ├── route.ts            # GET — listar pedidos
│               └── [id]/
│                   └── route.ts        # GET + PATCH — detalhe e atualizar status
├── components/
│   ├── ui/                             # shadcn/ui
│   ├── store/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── VariationPicker.tsx         # Seletor de tamanho + cor
│   │   ├── CartDrawer.tsx              # Carrinho lateral (drawer)
│   │   ├── CartItem.tsx
│   │   └── CategoryFilter.tsx
│   ├── admin/
│   │   ├── Sidebar.tsx
│   │   ├── ProductForm.tsx             # Formulário completo com variações
│   │   ├── VariationManager.tsx        # CRUD de variações inline
│   │   ├── OrderTable.tsx
│   │   └── StockBadge.tsx
│   └── layout/
│       ├── Header.tsx                  # Logo + nav + ícone carrinho
│       └── Footer.tsx
├── contexts/
│   └── CartContext.tsx                 # Estado global do carrinho
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   └── mercadopago.ts                  # Wrapper MP SDK
├── types/
│   └── index.ts
├── middleware.ts                        # Proteção /admin (exceto /admin/login)
├── .env.local
└── .env.example
```

---

## Banco de dados (Neon / PostgreSQL)

### Conexão

```ts
// lib/db.ts
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
export default sql;
```

### Schema SQL

```sql
-- 1. Categorias
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Produtos
CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) UNIQUE NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL,        -- preço base
  images        TEXT[] NOT NULL DEFAULT '{}',  -- array de URLs de imagem
  featured      BOOLEAN NOT NULL DEFAULT FALSE, -- destaque na home
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Variações (tamanho + cor + estoque individual)
CREATE TABLE IF NOT EXISTS variations (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        VARCHAR(20),               -- PP, P, M, G, GG, XGG ou NULL
  color       VARCHAR(50),               -- ex: "Rosa", "Azul" ou NULL
  color_hex   VARCHAR(7),                -- ex: "#FF69B4" para swatch visual
  sku         VARCHAR(100),              -- código interno opcional
  stock       INTEGER NOT NULL DEFAULT 0,
  price_modifier NUMERIC(8,2) DEFAULT 0, -- diferença de preço em relação ao base (pode ser negativo)
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(product_id, size, color)
);

-- 4. Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  mp_preference_id VARCHAR(255),               -- ID da preferência MP
  mp_payment_id   VARCHAR(255),               -- ID do pagamento MP (após pagamento)
  status          VARCHAR(30) NOT NULL DEFAULT 'pendente',
  -- pendente | aprovado | cancelado | em_preparacao | enviado | entregue
  customer_name   VARCHAR(255) NOT NULL,
  customer_email  VARCHAR(255) NOT NULL,
  customer_phone  VARCHAR(50),
  customer_cpf    VARCHAR(14),
  shipping_address TEXT,                       -- JSON serializado com endereço
  subtotal        NUMERIC(10,2) NOT NULL,
  shipping_cost   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL,
  notes           TEXT,                        -- observações do cliente
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variation_id  INTEGER REFERENCES variations(id) ON DELETE RESTRICT,
  product_name  VARCHAR(255) NOT NULL,         -- snapshot do nome (produto pode mudar)
  variation_desc VARCHAR(100),                 -- snapshot "M / Rosa" (variação pode mudar)
  unit_price    NUMERIC(10,2) NOT NULL,        -- snapshot do preço no momento da compra
  quantity      INTEGER NOT NULL,
  subtotal      NUMERIC(10,2) NOT NULL         -- unit_price * quantity
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_slug       ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(featured);
CREATE INDEX IF NOT EXISTS idx_variations_product  ON variations(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_mp_payment   ON orders(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
```

---

## Variáveis de ambiente

```bash
# Loja
NEXT_PUBLIC_STORE_NAME=
NEXT_PUBLIC_STORE_DESCRIPTION=
NEXT_PUBLIC_STORE_COLOR=#000000
NEXT_PUBLIC_STORE_COLOR_DARK=#000000
NEXT_PUBLIC_STORE_LOGO_URL=
NEXT_PUBLIC_WHATSAPP=

# Banco
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=

# Mercado Pago
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

---

## API Routes — contratos

### GET /api/products
Lista produtos ativos com filtro opcional por categoria.

**Query params:** `?category=biquinis&featured=true&page=1&limit=20`

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Biquíni Floral",
      "slug": "biquini-floral",
      "price": 129.90,
      "images": ["https://..."],
      "category": { "id": 1, "name": "Biquínis", "slug": "biquinis" },
      "featured": true,
      "hasStock": true
    }
  ],
  "total": 24,
  "page": 1,
  "pages": 2
}
```

---

### GET /api/products/[slug]
Produto completo com todas as variações ativas.

**Response:**
```json
{
  "id": 1,
  "name": "Biquíni Floral",
  "slug": "biquini-floral",
  "description": "...",
  "price": 129.90,
  "images": ["https://...", "https://..."],
  "category": { "id": 1, "name": "Biquínis" },
  "variations": [
    {
      "id": 1,
      "size": "P",
      "color": "Rosa",
      "colorHex": "#FF69B4",
      "stock": 3,
      "priceModifier": 0,
      "finalPrice": 129.90
    }
  ],
  "availableSizes": ["P", "G"],
  "availableColors": ["Rosa"]
}
```

---

### POST /api/checkout
Cria preferência no Mercado Pago e retorna URL de redirect.

**Request body:**
```json
{
  "items": [
    {
      "productId": 1,
      "variationId": 1,
      "quantity": 2
    }
  ],
  "customer": {
    "name": "Ana Lima",
    "email": "ana@email.com",
    "phone": "(67) 99999-9999",
    "cpf": "000.000.000-00"
  },
  "shippingAddress": {
    "street": "Rua X",
    "number": "123",
    "complement": "Apto 1",
    "neighborhood": "Centro",
    "city": "Campo Grande",
    "state": "MS",
    "zipCode": "79000-000"
  },
  "notes": "Sem complemento"
}
```

**Lógica (CRÍTICO — toda validação no servidor):**
1. Buscar produtos e variações no banco pelos IDs recebidos — NUNCA usar preços do body
2. Verificar estoque de cada variação — se insuficiente, retornar `409` com item problemático
3. Calcular subtotal e total no servidor
4. Criar pedido no banco com status `pendente`
5. Criar preferência no Mercado Pago com os itens validados
6. Atualizar pedido com `mp_preference_id`
7. Retornar `{ checkoutUrl, orderId }`

**Response:**
```json
{
  "checkoutUrl": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "orderId": 42
}
```

---

### POST /api/webhook
Recebe notificações do Mercado Pago sobre mudança de status de pagamento.

**Lógica:**
1. Validar assinatura do webhook com `MP_WEBHOOK_SECRET`
2. Se `type === 'payment'`: buscar detalhes do pagamento via MP SDK
3. Mapear status MP → status interno:
   - `approved` → `aprovado` + decrementar estoque das variações
   - `rejected` / `cancelled` → `cancelado`
   - `in_process` / `pending` → `pendente`
4. Atualizar pedido no banco pelo `mp_payment_id`
5. Retornar `200` imediatamente (MP exige resposta rápida)

**Decremento de estoque:** só decrementar quando `aprovado` — nunca antes.

---

### GET /api/admin/dashboard

**Response:**
```json
{
  "hoje": { "pedidos": 3, "receita": 389.70 },
  "mes": { "pedidos": 47, "receita": 5830.00 },
  "pendentes": 2,
  "semEstoque": 4,
  "pedidosRecentes": [...]
}
```

---

### GET + POST /api/admin/products
- GET: lista todos (ativos e inativos) com paginação
- POST: cria produto com variações

**POST Request body:**
```json
{
  "name": "Biquíni Floral",
  "categoryId": 1,
  "description": "...",
  "price": 129.90,
  "images": ["https://..."],
  "featured": false,
  "variations": [
    { "size": "P", "color": "Rosa", "colorHex": "#FF69B4", "stock": 5 },
    { "size": "M", "color": "Rosa", "colorHex": "#FF69B4", "stock": 3 }
  ]
}
```

---

### PATCH /api/admin/products/[id]

```json
{
  "name": "Biquíni Floral Novo",
  "featured": true,
  "variations": {
    "add": [{ "size": "GG", "color": "Rosa", "colorHex": "#FF69B4", "stock": 2 }],
    "update": [{ "id": 1, "stock": 10 }],
    "remove": [3]
  }
}
```

---

### GET + PATCH /api/admin/orders/[id]
- GET: pedido completo com itens
- PATCH: atualizar status `{ "status": "em_preparacao" }`

**Fluxo de status manual:** `aprovado` → `em_preparacao` → `enviado` → `entregue`

---

## Autenticação (NextAuth.js — usuário único)

```ts
// lib/auth.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (
          credentials?.email === process.env.ADMIN_EMAIL &&
          bcrypt.compareSync(credentials.password, process.env.ADMIN_PASSWORD_HASH!)
        ) {
          return { id: '1', email: credentials.email, name: 'Admin' };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
```

---

## Carrinho (client-side)

O carrinho é gerenciado no cliente com Context API + `localStorage`. Nenhum dado de carrinho vai para o banco — só na hora do checkout.

**Regra:** ao adicionar item, verificar se `variationId` já existe no carrinho — se sim, incrementar quantidade ao invés de duplicar.

---

## Integração Mercado Pago

```ts
// lib/mercadopago.ts
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const preference = new Preference(client);
export const payment = new Payment(client);
```

---

## Telas e funcionalidades

### `/` — Home
- Banner hero com `NEXT_PUBLIC_STORE_NAME` e CTA "Ver produtos"
- Seção "Em destaque" — grid de produtos com `featured = true`
- Seção de categorias
- Footer com WhatsApp

### `/produtos` — Catálogo
- Filtro lateral por categoria
- Grid de ProductCards responsivo (2 colunas mobile, 3-4 desktop)
- Badge "Esgotado" em cinza quando `hasStock = false`
- Paginação

### `/produtos/[slug]` — Produto
- Galeria de imagens (principal + miniaturas)
- Nome, preço, descrição
- **VariationPicker:** selecionar cor (swatches coloridos) → depois tamanho disponível para a cor selecionada
- Variações sem estoque: exibir riscadas e desabilitadas
- Quantidade (1 a min(stock, 10))
- Botão "Adicionar ao carrinho" — disabled se nenhuma variação selecionada
- Botão "Comprar pelo WhatsApp" (alternativo)

### `/carrinho` — Carrinho
- Lista de CartItems com foto, nome, variação, preço, quantidade
- Controles de quantidade (+/-)
- Botão remover item
- Subtotal + aviso de frete
- Botão "Finalizar compra" → `/checkout`

### `/checkout` — Formulário
- Dados pessoais: nome, email, telefone, CPF
- Endereço de entrega completo
- Observações opcionais
- Resumo do pedido (readonly)
- Botão "Ir para pagamento" → chama `POST /api/checkout` → redireciona para MP

### `/checkout/sucesso`
- Confirmação com número do pedido
- Resumo do que foi comprado
- Botão "Ver mais produtos"

### `/admin` — Dashboard
- Cards de métricas (pedidos hoje, receita do mês, pendentes)
- Tabela de pedidos recentes com status colorido
- Card de alerta se houver variações sem estoque

### `/admin/produtos`
- Tabela com foto, nome, categoria, preço, estoque total, status
- Botão "Novo produto" → `/admin/produtos/novo`
- Ações: editar, ativar/desativar

### `/admin/produtos/novo` e `/admin/produtos/[id]`
- Formulário completo com dados básicos, imagens, toggle destaque
- **VariationManager:** tabela inline para adicionar/editar/remover variações

### `/admin/pedidos`
- Tabela com: número, data, cliente, total, status, ações
- Filtro por status

### `/admin/pedidos/[id]`
- Dados do cliente e endereço de entrega
- Lista de itens com snapshot de preço e variação
- Status atual + dropdown para avançar status manualmente

---

## Deploy na Vercel

**Para cada novo cliente:**
1. Clonar repositório: `git clone ... nome-do-cliente`
2. Atualizar identidade visual: `tailwind.config.ts` (cores) + `Header.tsx` (logo) + `layout.tsx` (fonte/metadata)
3. Criar projeto na Vercel apontando para o novo repositório
4. Criar banco no Neon (projeto novo)
5. Rodar schema SQL no Neon SQL Editor
6. Gerar `ADMIN_PASSWORD_HASH`: `node -e "const b=require('bcryptjs');console.log(b.hashSync('SENHA',12))"`
7. Configurar variáveis de ambiente na Vercel
8. Configurar domínio customizado (opcional)
9. Deploy automático no push

---

## Observações importantes

1. **Preços SEMPRE validados no servidor.** O body do checkout recebe apenas `productId`, `variationId` e `quantity`. Preços são buscados no banco. Nunca confiar em valores vindos do frontend.

2. **Estoque decrementado apenas após pagamento aprovado** — via webhook. Nunca no momento do checkout.

3. **Snapshot de preço e variação nos itens do pedido.** Os campos `product_name`, `variation_desc` e `unit_price` em `order_items` são cópias no momento da compra.

4. **Webhook antes de sucesso.** O MP pode chamar o webhook antes de redirecionar o usuário para `/checkout/sucesso`. A página de sucesso deve buscar o status do pedido no banco.

5. **Soft delete em produtos e variações.** Nunca deletar do banco — `active = false`.

6. **Variações com `price_modifier`.** O preço final de uma variação é `product.price + variation.price_modifier`.

7. **Teste de webhook local.** Usar `ngrok http 3000` para expor localhost e configurar a URL no painel do MP durante desenvolvimento.
