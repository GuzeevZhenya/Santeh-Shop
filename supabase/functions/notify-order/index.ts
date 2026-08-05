// Supabase Edge Function: notify-order
// Deploy: supabase functions deploy notify-order
// Secrets: RESEND_API_KEY, NOTIFY_EMAIL (shop inbox)
// Optional: call via Database Webhook on orders INSERT/UPDATE

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const NOTIFY_EMAIL = Deno.env.get('NOTIFY_EMAIL') || 'info@aquamarket.by';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'АкваМаркет <onboarding@resend.dev>';

type OrderPayload = {
  type?: string;
  record?: {
    order_number?: string;
    customer_name?: string;
    phone?: string;
    customer_email?: string | null;
    total?: number;
    status?: string;
    address?: string | null;
  };
  old_record?: { status?: string };
};

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — email skipped');
    return { skipped: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  return { ok: res.ok, body: await res.text() };
}

serve(async (req) => {
  try {
    const body = (await req.json()) as OrderPayload;
    const o = body.record || {};
    const isStatusChange =
      body.type === 'UPDATE' && body.old_record?.status && body.old_record.status !== o.status;

    const adminHtml = `
      <h2>Заказ ${o.order_number || ''}</h2>
      <p>Клиент: ${o.customer_name || ''} · ${o.phone || ''}</p>
      <p>Email: ${o.customer_email || '—'}</p>
      <p>Адрес: ${o.address || '—'}</p>
      <p>Сумма: ${o.total ?? 0} руб.</p>
      <p>Статус: ${o.status || 'new'}</p>
    `;

    await sendEmail(
      NOTIFY_EMAIL,
      isStatusChange
        ? `Статус заказа ${o.order_number}: ${o.status}`
        : `Новый заказ ${o.order_number}`,
      adminHtml,
    );

    if (o.customer_email) {
      const customerHtml = isStatusChange
        ? `<p>Статус вашего заказа <b>${o.order_number}</b> изменён на: <b>${o.status}</b>.</p>`
        : `<p>Спасибо за заказ <b>${o.order_number}</b>! Мы свяжемся с вами для подтверждения.</p>`;
      await sendEmail(
        o.customer_email,
        isStatusChange ? `Заказ ${o.order_number}: новый статус` : `Заказ ${o.order_number} принят`,
        customerHtml,
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
