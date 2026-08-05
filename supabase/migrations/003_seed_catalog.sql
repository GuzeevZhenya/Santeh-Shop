-- Seed catalog: products + banners (depends on categories from 001)

do $$
declare
  c_vanny uuid;
  c_rakoviny uuid;
  c_smesiteli uuid;
  c_dushevye uuid;
  c_unitazy uuid;
  c_mebel uuid;
  c_vodonagrev uuid;
  c_polot uuid;
begin
  select id into c_vanny from public.categories where slug = 'vanny' limit 1;
  select id into c_rakoviny from public.categories where slug = 'rakoviny' limit 1;
  select id into c_smesiteli from public.categories where slug = 'smesiteli' limit 1;
  select id into c_dushevye from public.categories where slug = 'dushevye' limit 1;
  select id into c_unitazy from public.categories where slug = 'unitazy' limit 1;
  select id into c_mebel from public.categories where slug = 'mebel' limit 1;
  select id into c_vodonagrev from public.categories where slug = 'vodonagrevateli' limit 1;
  select id into c_polot from public.categories where slug = 'polotentsesushiteli' limit 1;

  if not exists (select 1 from public.products limit 1) then
    insert into public.products (
      name, category_id, price, old_price, description, brand, specs,
      rating, is_deal_of_day, in_carousel, is_active, image_url
    ) values
    (
      'Акриловая ванна «Атланта» 160×70',
      c_vanny, 1212, 1350,
      'Акриловая ванна классической формы. Усиленный каркас, антискользящее покрытие.',
      'Aquanet', 'Размер: 160×70 см\nМатериал: акрил\nОбъём: 180 л',
      4.8, true, true, true,
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80'
    ),
    (
      'Стальная ванна «Классик» 150×70',
      c_vanny, 890, 990,
      'Стальная эмалированная ванна. Устойчива к ударам и перепадам температуры.',
      'Kaldewei', 'Размер: 150×70 см\nМатериал: сталь\nТолщина: 3,5 мм',
      4.6, false, false, true,
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80'
    ),
    (
      'Раковина накладная «Овал 60»',
      c_rakoviny, 189, 220,
      'Керамическая накладная раковина овальной формы.',
      'Cersanit', 'Ширина: 60 см\nМатериал: керамика',
      4.7, false, false, true,
      'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800&q=80'
    ),
    (
      'Раковина встраиваемая «Квадро 55»',
      c_rakoviny, 159, null,
      'Встраиваемая раковина для столешницы.',
      'Roca', 'Ширина: 55 см\nФорма: прямоугольная',
      4.5, false, false, true,
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80'
    ),
    (
      'Смеситель для раковины «Хром Pro»',
      c_smesiteli, 129, 159,
      'Однорычажный смеситель с аэратором. Хромированная отделка.',
      'Grohe', 'Тип: однорычажный\nОтделка: хром\nГарантия: 5 лет',
      4.9, false, true, true,
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80'
    ),
    (
      'Смеситель для ванны «Термостат»',
      c_smesiteli, 249, 289,
      'Термостатический смеситель с защитой от ожогов.',
      'Hansgrohe', 'Тип: термостат\nОтделка: хром',
      4.8, false, false, true,
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80'
    ),
    (
      'Душевая система «Тропический дождь»',
      c_dushevye, 459, 520,
      'Стойка с тропическим душем и ручной лейкой. Гидромассажные форсунки.',
      'WasserKraft', 'Верхний душ: Ø250 мм\nМатериал: латунь + ABS',
      4.7, true, true, true,
      'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=800&q=80'
    ),
    (
      'Душевой уголок «Стекло 90»',
      c_dushevye, 689, null,
      'Раздвижной душевой уголок с прозрачным стеклом 6 мм.',
      'Cezares', 'Размер: 90×90 см\nСтекло: 6 мм',
      4.4, false, false, true,
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80'
    ),
    (
      'Унитаз подвесной «Компакт»',
      c_unitazy, 319, 359,
      'Подвесной унитаз с инсталляцией. Безободковый, двойной слив.',
      'Geberit', 'Тип: подвесной\nСлив: 3/6 л\nБезободковый',
      4.8, false, false, true,
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80'
    ),
    (
      'Унитаз напольный «Классика»',
      c_unitazy, 199, null,
      'Напольный унитаз с бачком. Горизонтальный выпуск.',
      'Cersanit', 'Тип: напольный\nВыпуск: горизонтальный',
      4.3, false, false, true,
      'https://images.unsplash.com/photo-1564540586988-aa4e53869734?w=800&q=80'
    ),
    (
      'Зеркало-шкаф «Кристалл 80»',
      c_mebel, 159, 189,
      'Зеркальный шкаф с LED-подсветкой и розеткой.',
      'Акватон', 'Ширина: 80 см\nПодсветка: LED',
      4.6, false, false, true,
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80'
    ),
    (
      'Пенал для ванной «Колонна»',
      c_mebel, 239, 269,
      'Высокий пенал с двумя дверцами и полками.',
      'Акватон', 'Высота: 170 см\nЦвет: белый глянец',
      4.5, false, false, true,
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
    ),
    (
      'Тумба с раковиной «Модерн 70»',
      c_mebel, 349, 399,
      'Подвесная тумба с ящиками и раковиной.',
      'Am.Pm', 'Ширина: 70 см\nЦвет: белый',
      4.7, false, true, true,
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
    ),
    (
      'Водонагреватель Thermex 80 л',
      c_vodonagrev, 429, 479,
      'Накопительный водонагреватель. Сухие ТЭНы, электронное управление.',
      'Thermex', 'Объём: 80 л\nМощность: 2 кВт\nТЭНы: сухие',
      4.8, false, true, true,
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80'
    ),
    (
      'Водонагреватель Thermex 50 л',
      c_vodonagrev, 349, null,
      'Компактный накопительный водонагреватель для квартиры.',
      'Thermex', 'Объём: 50 л\nМощность: 1,5 кВт',
      4.6, false, false, true,
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    ),
    (
      'Проточный водонагреватель Electrolux',
      c_vodonagrev, 189, 219,
      'Проточный электрический нагреватель для раковины или душа.',
      'Electrolux', 'Мощность: 3,5 кВт\nТип: проточный',
      4.4, false, false, true,
      'https://images.unsplash.com/photo-1584622781867-64310d961ba7?w=800&q=80'
    ),
    (
      'Полотенцесушитель «Лесенка 50×60»',
      c_polot, 139, 159,
      'Водяной полотенцесушитель лестничного типа. Латунь.',
      'Сунержа', 'Размер: 50×60 см\nПодключение: боковое',
      4.7, false, false, true,
      'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=800&q=80'
    ),
    (
      'Полотенцесушитель «М-образный 50×50»',
      c_polot, 89, 109,
      'Классическая М-образная форма. Латунь с хромированием.',
      'Двин', 'Размер: 50×50 см\nФорма: М-образная',
      4.5, false, false, true,
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80'
    ),
    (
      'Электрический полотенцесушитель «Комфорт»',
      c_polot, 179, null,
      'Электрический полотенцесушитель с терморегулятором.',
      'Сунержа', 'Мощность: 100 Вт\nПитание: 220 В',
      4.6, false, false, true,
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80'
    ),
    (
      'Душевой гарнитур «Лейка 3 режима»',
      c_dushevye, 69, 89,
      'Ручная лейка с шлангом и держателем. 3 режима струи.',
      'Grohe', 'Режимы: 3\nДлина шланга: 1,5 м',
      4.4, false, false, true,
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80'
    );
  end if;

  if not exists (select 1 from public.banners limit 1) then
    insert into public.banners (title, subtitle, image_url, badge, sort_order, is_active) values
    (
      'Сезонная распродажа сантехники',
      'Скидки до 40% на ванны и смесители',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1400&q=80',
      '−40%',
      1, true
    ),
    (
      'Премиальные смесители',
      'Хромированная отделка и водосберегающие технологии',
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1400&q=80',
      'Новинки',
      2, true
    ),
    (
      'Душевые системы нового поколения',
      'Тропический дождь и гидромассаж',
      'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=1400&q=80',
      'Хит',
      3, true
    ),
    (
      'Водонагреватели Thermex',
      'Надёжность и экономия электроэнергии',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=80',
      'Гарантия',
      4, true
    );
  end if;
end $$;
