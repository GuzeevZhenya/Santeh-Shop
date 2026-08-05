# Что осталось сделать — АкваМаркет

Файл можно перезаписывать: отмечайте `[x]` выполненное или удаляйте пункты.

Обновлено: 2026-08-05

---

## Перед публикацией (обязательно)

- [ ] Выполнить в Supabase SQL Editor миграции по порядку: `001` → `002` → `003` → `004` → `005` (если ещё не все)
- [ ] В `.env` и на хостинге только **publishable/anon** ключ (не `sb_secret_`)
- [ ] Authentication → URL Configuration: Site URL = прод-домен, Redirect URLs = `https://домен/**` и `http://localhost:5173/**`
- [ ] Заполнить в админке **УНП** и точное юр. наименование (Настройки)
- [ ] Войти как `shyst.evgeny@mail.ru`, проверить `/admin`
- [ ] Задеплоить фронт (Vercel/Netlify): `npm run build`, output `dist`, env `VITE_SUPABASE_*`
- [ ] Прогнать смоук: регистрация, заказ, перезвон, админ меняет статус заказа

## Желательно скоро

- [ ] Email-уведомления о заказах (Edge Function `notify-order` + Resend + webhook)
- [ ] Добавить `og:image` в `index.html` для превью в соцсетях
- [ ] Русские шаблоны писем Auth (confirm / reset) в Dashboard
- [ ] Captcha на Auth (Attack Protection) — по желанию на проде
- [ ] Проверить Security Advisor после `005`; Accept/закрыть остаточные WARN по публичному Storage

## Контент и витрина

- [ ] Проверить/подправить реальные фото товаров (загрузка в Storage через админку)
- [ ] При необходимости сократить число «Акция дня» до 4–6 товаров вручную в админке
- [ ] Дозаполнить баннеры под сезон
- [ ] Проверить тексты Privacy/Offer с финальным УНП

## Не срочно / позже

- [ ] Онлайн-оплата (bePaid / ЕРИП) — сейчас заявка + оплата при получении
- [ ] Google OAuth
- [ ] CSV импорт/экспорт товаров
- [ ] Капча на открытые формы (отзывы, перезвон)
- [ ] i18n (be)
- [ ] FSD-рефакторинг — не обязателен
- [ ] Leaked password protection — на Free часто нет; после Pro

## Уже сделано (кратко)

- [x] React + TS + Vite + Supabase
- [x] Витрина, корзина, checkout, кабинет, админка
- [x] ПДн: политика, оферта, согласия, cookie-баннер, consent_logs
- [x] Бренды, категории 2 колонки + `/categories`
- [x] Карусель товара + рекомендации
- [x] Репо: https://github.com/GuzeevZhenya/Santeh-Shop
- [x] `vercel.json`, README с инструкцией

---

## Быстрые ссылки

| Что | Где |
|-----|-----|
| Миграции | `supabase/migrations/` |
| Подсказки SQL | `supabase/APPLY_ALL.sql` |
| Пример env | `.env.example` |
| GitHub | https://github.com/GuzeevZhenya/Santeh-Shop |
