import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import sql from '@/lib/db';
import { payment } from '@/lib/mercadopago';

function mpStatusToInternal(mpStatus: string): string {
  switch (mpStatus) {
    case 'approved':
      return 'aprovado';
    case 'rejected':
    case 'cancelled':
      return 'cancelado';
    default:
      return 'pendente';
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Validar assinatura do webhook
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (secret) {
    const sig = request.headers.get('x-signature') ?? '';
    const ts = sig.match(/ts=([^,]+)/)?.[1] ?? '';
    const v1 = sig.match(/v1=([^,]+)/)?.[1] ?? '';
    const xRequestId = request.headers.get('x-request-id') ?? '';
    const manifest = `id:${new URL(request.url).searchParams.get('data.id') ?? ''};request-id:${xRequestId};ts:${ts};`;
    const hash = createHmac('sha256', secret).update(manifest).digest('hex');
    if (hash !== v1) {
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    }
  }

  const data = JSON.parse(rawBody);

  if (data.type !== 'payment') {
    return NextResponse.json({ ok: true });
  }

  const paymentId = data.data?.id;
  if (!paymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const paymentData = await payment.get({ id: paymentId });
    const mpStatus = paymentData.status ?? '';
    const externalRef = paymentData.external_reference;
    const internalStatus = mpStatusToInternal(mpStatus);

    await sql`
      UPDATE orders
      SET status = ${internalStatus},
          mp_payment_id = ${String(paymentId)},
          updated_at = NOW()
      WHERE id = ${Number(externalRef)}
    `;

    // Decrementar estoque apenas quando aprovado
    if (internalStatus === 'aprovado') {
      const items = await sql`
        SELECT variation_id, quantity
        FROM order_items
        WHERE order_id = ${Number(externalRef)}
      `;
      for (const item of items) {
        await sql`
          UPDATE variations
          SET stock = GREATEST(0, stock - ${item.quantity as number})
          WHERE id = ${item.variation_id as number}
        `;
      }
    }
  } catch {
    // MP pode retentar — retornar 200 para não gerar loop
  }

  return NextResponse.json({ ok: true });
}
