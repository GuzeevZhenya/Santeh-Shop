# AquaMarket (Santeh-Shop)

Интернет-магазин сантехники для **Беларуси (РБ)**. Валюта — белорусский рубль (BYN). Интерфейс на русском.

**Репозиторий:** https://santeh-shop-1tm23fulo-guzeevzhenya199602-6642s-projects.vercel.app/

## Стек

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + компоненты в стиле shadcn/ui
- **lucide-react**, **recharts**, **react-router-dom** v6
- **Supabase** — Auth (email/пароль), Postgres, RLS, Storage, RPC
- Деплой: **Vercel** (`vercel.json` — SPA rewrite)

## Возможности

- Каталог, категории (дерево 2 уровня + страница «Все категории»), поиск, суперцены
- Корзина, оформление заказа (доставка/самовывоз, онлайн/оплата при получении)
- Личный кабинет, избранное, сравнения, история просмотров, лояльность
- Админ-панель: заказы, товары, категории, галерея, акции, настройки, аналитика
- ПДн: политика/оферта/cookies, cookie-баннер, журнал согласий `consent_logs`
- Уведомления об остатках товаров + пиксель ретаргетинга

## Быстрый старт (локально)

```bash
git clone https://github.com/GuzeevZhenya/Santeh-Shop.git
cd Santeh-Shop
npm install
cp .env.example .env
```

В `.env` укажите (только публичные ключи):

```env
VITE_SUPABASE_URL=https://XXXX.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...   # или eyJ... (anon)
```

**Важно:** во фронтенд попадают только **publishable / anon**.  
Ключи `sb_secret_...` / `service_role` в `.env` клиента ставить **нельзя** (ошибка `Forbidden use of secret API key in browser`). Файл `.env` в git не коммитится.

```bash
npm run dev
```

Откройте http://localhost:5173

Сборка: `npm run build` → папка `dist`. Превью: `npm run preview`.

## Supabase: миграции (обязательно)

В **SQL Editor** выполните **по порядку**:

1. `supabase/migrations/001_aquamarket_schema.sql` — таблицы, RLS, RPC, категории, контакты  
2. `supabase/migrations/002_consent_and_legal.sql` — юр. тексты, согласия, Storage, `create_order`  
3. `supabase/migrations/003_seed_catalog.sql` — товары и каталог  
4. `supabase/migrations/004_deals_gallery_admin.sql` — акции дня, галерея, админ  
5. `supabase/migrations/005_security_hardening.sql` — hardening под Security Advisor  

Опционально одной пачкой: `supabase/APPLY_ALL.sql` (если есть в репозитории).

### Auth

- **Authentication → URL Configuration**
  - Site URL: прод-домен (или `http://localhost:5173` для разработки)
  - Redirect URLs: `http://localhost:5173/**` и `https://ваш-домен/**`
- Captcha — по желанию на проде

### Админ

Логин админа: **`shyst.evgeny@mail.ru`** (назначается миграцией `004`, в т.ч. при регистрации).

Проверка роли: **Админ → пользователи** (или через таблицу профилей в Dashboard).

В **Настройках** заполните **ИНН** и точные юр. реквизиты перед публичным запуском.

## Деплой (Vercel)

```bash
npm run build
```

- Output Directory: `dist`
- `vercel.json` — rewrite SPA на `index.html`
- В Vercel задайте те же `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` (только publishable/anon)
- Добавьте прод-домен в Supabase Auth Redirect URLs

Netlify: аналогично — publish `dist`, SPA redirect на `index.html`.

## Персональные данные (РБ) — кратко

- Политика, оферта и cookie-тексты хранятся/редактируются из админки; журнал согласий — таблица `consent_logs` (миграция `002`)
- Cookie-баннер и чекбоксы согласия при регистрации/заказе обязательны для корректной фиксации ПДн
- Перед запуском проверьте юр. реквизиты, контакты и формулировки документов под вашу организацию
- Не храните `service_role` и секреты в клиентском коде или публичных переменных Vercel

## Структура

```
src/
  pages/           # витрина, auth, кабинет, админка
  components/
    store/         # Navbar, корзина, карточки, категории…
    admin/         # админ-панель
    account/       # кабинет
    ui/            # button, dialog, image…
  lib/             # supabase, auth, loyalty, favorites…
supabase/
  migrations/      # SQL схема и seed (001–005)
  functions/       # notify-order (опционально)
```

## Опционально: письма о заказах

```bash
supabase functions deploy notify-order
supabase secrets set RESEND_API_KEY=re_xxx NOTIFY_EMAIL=info@aquamarket.by
```

Webhook на `orders` INSERT/UPDATE → Edge Function `notify-order`.

## Чеклист перед публикацией

- [ ] Миграции 001–005 выполнены  
- [ ] В `.env` / Vercel только publishable-ключи  
- [ ] Auth Redirect URLs настроены  
- [ ] ИНН и реквизиты заполнены  
- [ ] Вход админа работает (`/admin`, `shyst.evgeny@mail.ru`)  
- [ ] Тестовый заказ и галерея  

## Лицензия / контакты

Контакты магазина по умолчанию: г. Могилёв; тел. в `site_settings`.  
ИНН и юр. данные заполняются владельцем в админке.
