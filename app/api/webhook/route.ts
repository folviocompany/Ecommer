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
  try {
    const rawBody = await request.text();

    // Validar assinatura do webhook — obrigatória em produção
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) {
      console.error('MP_WEBHOOK_SECRET não configurado — webhook rejeitado');
      return NextResponse.json({ error: 'Webhook não configurado' }, { status: 500 });
    }

    const sig = request.headers.get('x-signature') ?? '';
    const ts = sig.match(/ts=([^,]+)/)?.[1] ?? '';
    const v1 = sig.match(/v1=([^,]+)/)?.[1] ?? '';
    const xRequestId = request.headers.get('x-request-id') ?? '';
    const manifest = `id:${new URL(request.url).searchParams.get('data.id') ?? ''};request-id:${xRequestId};ts:${ts};`;
    const hash = createHmac('sha256', secret).update(manifest).digest('hex');
    if (hash !== v1) {
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    }

    const data = JSON.parse(rawBody);

    if (data.type !== 'payment') {
      return NextResponse.json({ ok: true });
    }

    const paymentId = data.data?.id;
    if (!paymentId || typeof paymentId !== 'string' && typeof paymentId !== 'number') {
      return NextResponse.json({ ok: true });
    }

    const paymentData = await payment.get({ id: String(paymentId) });
    const mpStatus = paymentData.status ?? '';
    const externalRef = paymentData.external_reference;
    const orderId = Number(externalRef);

    if (!externalRef || isNaN(orderId)) {
      console.error(`Webhook: external_reference inválido: ${externalRef}`);
      return NextResponse.json({ ok: true });
    }

    const internalStatus = mpStatusToInternal(mpStatus);

    // Idempotência: só atualiza se o status ainda não é 'aprovado'
    // Retorna o status anterior para saber se precisamos decrementar estoque
    const [updated] = await sql`
      UPDATE orders
      SET status = ${internalStatus},
          mp_payment_id = ${String(paymentId)},
          updated_at = NOW()
      WHERE id = ${orderId}
        AND status <> 'aprovado'
      RETURNING id
    `;

    // Só decrementa estoque na primeira transição para aprovado
    if (updated && internalStatus === 'aprovado') {
      const items = await sql`
        SELECT variation_id, quantity
        FROM order_items
        WHERE order_id = ${orderId}
      `;
      for (const item of items) {
        await sql`
          UPDATE variations
          SET stock = GREATEST(0, stock - ${item.quantity as number})
          WHERE id = ${item.variation_id as number}
        `;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Retorna 500 para que o MP reenvie em falhas transitórias
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
