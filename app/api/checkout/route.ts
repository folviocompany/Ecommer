import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { preference } from '@/lib/mercadopago';
import type { CheckoutItem, CheckoutCustomer, ShippingAddress } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      customer,
      shippingAddress,
      notes,
    }: {
      items: CheckoutItem[];
      customer: CheckoutCustomer;
      shippingAddress: ShippingAddress;
      notes?: string;
    } = body;

    if (!items?.length || !customer || !shippingAddress) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // 1. Buscar produtos e variações no banco (nunca confiar no preço do body)
    const variationIds = items.map((i) => i.variationId);
    const dbVariations = await sql`
      SELECT
        v.id, v.product_id, v.stock, v.price_modifier, v.size, v.color,
        p.name AS product_name, p.price AS base_price, p.images
      FROM variations v
      JOIN products p ON p.id = v.product_id
      WHERE v.id = ANY(${variationIds}::int[])
        AND v.active = true
        AND p.active = true
    `;

    // 2. Verificar estoque
    for (const item of items) {
      const variation = dbVariations.find((v: Record<string, unknown>) => v.id === item.variationId);
      if (!variation) {
        return NextResponse.json(
          { error: 'Variação não encontrada', variationId: item.variationId },
          { status: 409 }
        );
      }
      if ((variation.stock as number) < item.quantity) {
        return NextResponse.json(
          {
            error: 'Estoque insuficiente',
            variationId: item.variationId,
            available: variation.stock,
          },
          { status: 409 }
        );
      }
    }

    // 3. Calcular totais no servidor
    let subtotal = 0;
    const orderLines = items.map((item) => {
      const variation = dbVariations.find((v: Record<string, unknown>) => v.id === item.variationId)!;
      const unitPrice = Number(variation.base_price) + Number(variation.price_modifier);
      const lineSubtotal = unitPrice * item.quantity;
      subtotal += lineSubtotal;
      const parts = [variation.size, variation.color].filter(Boolean);
      return {
        variationId: item.variationId,
        productId: variation.product_id,
        productName: variation.product_name as string,
        variationDesc: parts.join(' / '),
        unitPrice,
        quantity: item.quantity,
        subtotal: lineSubtotal,
        image: (variation.images as string[])?.[0] ?? '',
      };
    });

    const shippingCost = 0;
    const total = subtotal + shippingCost;

    // 4. Criar pedido no banco
    const [order] = await sql`
      INSERT INTO orders (
        status, customer_name, customer_email, customer_phone, customer_cpf,
        shipping_address, subtotal, shipping_cost, total, notes
      ) VALUES (
        'pendente',
        ${customer.name}, ${customer.email}, ${customer.phone}, ${customer.cpf},
        ${JSON.stringify(shippingAddress)},
        ${subtotal}, ${shippingCost}, ${total},
        ${notes ?? null}
      )
      RETURNING id
    `;

    const orderId = order.id as number;

    await sql`
      INSERT INTO order_items (
        order_id, product_id, variation_id, product_name, variation_desc,
        unit_price, quantity, subtotal
      )
      SELECT
        unnest(${orderLines.map((l) => orderId)}::int[]),
        unnest(${orderLines.map((l) => l.productId)}::int[]),
        unnest(${orderLines.map((l) => l.variationId)}::int[]),
        unnest(${orderLines.map((l) => l.productName)}::text[]),
        unnest(${orderLines.map((l) => l.variationDesc)}::text[]),
        unnest(${orderLines.map((l) => l.unitPrice)}::numeric[]),
        unnest(${orderLines.map((l) => l.quantity)}::int[]),
        unnest(${orderLines.map((l) => l.subtotal)}::numeric[])
    `;

    // 5. Criar preferência no Mercado Pago
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const mpItems = orderLines.map((line) => ({
      id: String(line.variationId),
      title: line.variationDesc
        ? `${line.productName} — ${line.variationDesc}`
        : line.productName,
      quantity: line.quantity,
      unit_price: line.unitPrice,
      currency_id: 'BRL',
      picture_url: line.image || undefined,
    }));

    const pref = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: customer.name,
          email: customer.email,
          phone: { number: customer.phone },
          identification: { type: 'CPF', number: customer.cpf.replace(/\D/g, '') },
        },
        back_urls: {
          success: `${appUrl}/checkout/sucesso?orderId=${orderId}`,
          pending: `${appUrl}/checkout/pendente?orderId=${orderId}`,
          failure: `${appUrl}/carrinho`,
        },
        auto_return: 'approved',
        external_reference: String(orderId),
        notification_url: `${appUrl}/api/webhook`,
      },
    });

    // 6. Atualizar pedido com preference_id
    await sql`
      UPDATE orders SET mp_preference_id = ${pref.id} WHERE id = ${orderId}
    `;

    return NextResponse.json({
      checkoutUrl: pref.init_point,
      orderId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
