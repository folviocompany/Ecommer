@AGENTS.md

# CLAUDE.md
> Lido automaticamente pelo Claude Code em toda sessão. Regras globais do projeto.

---

## Projeto

Template de e-commerce para pequenos negócios. A loja de exemplo é a **DropStore** — streetwear fictício para demonstração.

## Stack obrigatória

- Next.js 14 com App Router (nunca Pages Router)
- TypeScript em todos os arquivos — sem exceção
- Tailwind CSS para estilização
- shadcn/ui para componentes base
- Neon via `@neondatabase/serverless` — nunca `pg` com pool TCP
- NextAuth.js para autenticação do admin
- Mercado Pago SDK v2 (`mercadopago`) para pagamentos

## Regras de segurança

- Preços e totais sempre calculados no servidor — nunca confiar em valores do body do cliente
- Estoque decrementado apenas via webhook do MP após `status = approved` — nunca no momento do checkout
- Variáveis sensíveis nunca com prefixo `NEXT_PUBLIC_` (apenas `STORE_NAME`, `STORE_COLOR` etc. são públicas)
- Toda rota `/api/admin/*` deve validar sessão via `getServerSession(authOptions)` antes de qualquer operação

## Regras de banco

- Soft delete obrigatório: produtos e variações usam `active = false`, nunca `DELETE`
- Snapshots em `order_items`: sempre salvar `product_name`, `variation_desc` e `unit_price` no momento da compra
- Nunca deletar `order_items` ou `orders` — apenas atualizar status

## Padrão de API Route

```ts
// Toda rota deve seguir este padrão
export async function GET(request: Request) {
  try {
    // lógica aqui
    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Padrão de rota admin

```ts
const session = await getServerSession(authOptions);
if (!session) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Configuração da DropStore (loja de exemplo)

Usar estas variáveis no `.env.local` para desenvolvimento:

```bash
NEXT_PUBLIC_STORE_NAME="DropStore"
NEXT_PUBLIC_STORE_DESCRIPTION="Drops exclusivos, estilo sem limite"
NEXT_PUBLIC_STORE_COLOR="#F97316"
NEXT_PUBLIC_STORE_COLOR_DARK="#EA6C00"
NEXT_PUBLIC_STORE_LOGO_URL=""
NEXT_PUBLIC_WHATSAPP="5567999999999"
ADMIN_EMAIL="admin@dropstore.com"
```

## Referências

- CONTEXT.md — arquitetura completa, schema SQL, contratos das APIs e checklist
- seed.sql — dados fictícios da DropStore para popular o banco
