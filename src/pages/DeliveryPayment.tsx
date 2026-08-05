import LegalLayout from '@/components/store/LegalLayout';
import { useSiteSettings } from '@/lib/siteSettings';

export default function DeliveryPayment() {
  const { settings } = useSiteSettings();
  const addr = settings.address || 'ул. Барташова 1, Жлобин, Гомельская область';
  const hours = settings.hours || 'Пн–Пт: 9:00 — 20:00 · Сб–Вс: 10:00 — 18:00';
  const phone = settings.phone || '+375 (29) 602-01-10';

  return (
    <LegalLayout title="Доставка и оплата" updated="5 августа 2026 г.">
      <h2 className="text-base font-semibold text-[#0F172A]">1. Доставка курьером (г. Жлобин)</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>стоимость: <strong>20 руб.</strong>, если сумма товаров менее 150 руб.;</li>
        <li><strong>бесплатно</strong> при сумме товаров от 150 руб.;</li>
        <li>доставка по району — по согласованию с менеджером;</li>
        <li>срок: обычно 1–3 рабочих дня после подтверждения заказа (уточняется).</li>
      </ul>

      <h2 className="text-base font-semibold text-[#0F172A]">2. Самовывоз</h2>
      <p>
        Бесплатно. Адрес: {addr}. Режим работы: {hours}. Телефон для согласования: {phone}.
      </p>

      <h2 className="text-base font-semibold text-[#0F172A]">3. Оплата</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>наличными при получении;</li>
        <li>банковской картой при получении (при наличии терминала).</li>
      </ul>
      <p>Онлайн-оплата на сайте может быть подключена дополнительно.</p>

      <h2 className="text-base font-semibold text-[#0F172A]">4. Приёмка товара</h2>
      <p>
        При получении проверьте комплектность и внешний вид. Претензии по видимым повреждениям
        предъявляются при приёмке. Подписание документов / приёмка без замечаний означает
        отсутствие видимых недостатков на момент передачи.
      </p>
    </LegalLayout>
  );
}
