-- =====================================================================
-- Hardens the public review-insert policy AND seeds ~10 test reviews
-- across different attractions so the moderation queue has data.
--
-- Run after 0003_admin_moderation.sql.
-- =====================================================================

-- 1. Force every anonymous insert to land as 'pending'. Without this,
--    a user could call createReview({ status_id: 'approved' }) from the
--    browser console and bypass moderation entirely.
drop policy if exists "reviews_insert_anon" on public.reviews;
create policy "reviews_insert_anon" on public.reviews
  for insert
  with check (status_id = 'pending');

-- 2. Seed test reviews. Picks the first 10 attractions deterministically
--    by created_at and sprinkles varied authors / ratings / texts across
--    them. Idempotent: skipped if any test review (by sentinel email) is
--    already present.
do $$
declare
  already_seeded boolean;
  rec record;
  authors text[]   := array['Анна Иванова','Сергей Петров','Мария Смирнова','Дмитрий Козлов','Екатерина Фёдорова','Алексей Морозов','Ольга Соколова','Иван Новиков','Татьяна Лебедева','Павел Васильев'];
  emails  text[]   := array['anna@test.local','sergey@test.local','maria@test.local','dmitry@test.local','katya@test.local','alex@test.local','olga@test.local','ivan@test.local','tatiana@test.local','pavel@test.local'];
  ratings integer[] := array[5, 4, 5, 3, 5, 4, 5, 2, 4, 5];
  texts   text[]   := array[
    'Прекрасное место! Обязательно вернёмся ещё. Атмосфера завораживает.',
    'Очень атмосферное место, рекомендую. Историческая ценность ощущается во всём.',
    'Замечательная история и красивые виды. Гид рассказал много интересного.',
    'Неплохо, но ожидала большего. Инфраструктура местами требует обновления.',
    'Великолепно! Дети были в восторге. Провели здесь полдня и не пожалели.',
    'Стоит того, чтобы посетить хотя бы раз. Удобно добираться, чисто, безопасно.',
    'Удивительно красивое место! Природа и архитектура гармонично сочетаются.',
    'Слишком многолюдно в выходные. Лучше приезжать в будний день с утра.',
    'Хорошо организовано, чисто. Понравилась музейная часть и сувенирная лавка.',
    'Одно из лучших мест в Псковской области. Любителям истории — обязательно к посещению.'
  ];
  i integer;
begin
  -- Sentinel — test reviews always use *@test.local. Bail if any exist.
  select exists (
    select 1 from public.reviews where user_email like '%@test.local'
  ) into already_seeded;

  if already_seeded then
    raise notice 'Test reviews already present, skipping seed.';
    return;
  end if;

  i := 1;
  for rec in
    select id, district_id from public.attractions
    order by created_at asc
    limit 10
  loop
    insert into public.reviews (
      attraction_id, district_id, author_name, user_email,
      rating, text, status_id, photo_urls, created_at
    ) values (
      rec.id,
      rec.district_id,
      authors[i],
      emails[i],
      ratings[i],
      texts[i],
      'pending',
      '{}',
      now() - (i || ' hours')::interval
    );
    i := i + 1;
  end loop;

  raise notice 'Seeded % test reviews.', i - 1;
end$$;
