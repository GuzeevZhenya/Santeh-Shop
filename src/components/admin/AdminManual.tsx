export default function AdminManual() {
  return (
    <div className="prose prose-sm max-w-3xl text-slate-600 space-y-4">
      <h2 className="text-xl font-bold text-[#0F172A]">Руководство администратора</h2>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Добавьте категории и товары во вкладках «Категории» / «Товары».</li>
        <li>Настройте телефон, адрес и объявление в «Настройки».</li>
        <li>Заказы приходят во вкладку «Заказы» — меняйте статус по мере обработки.</li>
        <li>Заявки «Перезвони мне» — во вкладке «Перезвоны».</li>
        <li>
          Чтобы назначить админа, в SQL Editor Supabase выполните:{' '}
          <code>update profiles set role = &apos;admin&apos; where email = &apos;you@mail.com&apos;;</code>
        </li>
        <li>Примените миграцию <code>supabase/migrations/001_aquamarket_schema.sql</code> в проекте Supabase.</li>
      </ol>
    </div>
  );
}
