-- =====================================================================
-- Seeds 50 more test reviews — 10 per attraction across 5 attractions.
-- Mix of approved/pending so:
--   * the map's review counts/avg ratings actually show data without an
--     admin pre-approving everything,
--   * the moderation queue still has fresh pending items to test on.
--
-- Idempotent: skipped if any review with @test2.local sentinel exists.
-- Run after 0004_test_reviews.sql.
-- =====================================================================

do $$
declare
  rec record;
  authors text[] := array[
    'Светлана Громова','Андрей Кузнецов','Елена Орлова','Михаил Зайцев','Наталья Беляева',
    'Артём Волков','Юлия Тарасова','Кирилл Яковлев','Виктория Михайлова','Денис Богданов'
  ];
  texts text[] := array[
    'Очень понравилось, советую посетить хотя бы раз. Атмосфера непередаваемая.',
    'Прекрасный пример русской архитектуры. Видно, что место бережно сохраняют.',
    'Заехали с детьми — все остались довольны. Много интересного и красивых видов.',
    'Тихое и душевное место. Идеально подходит для прогулок и фотографий.',
    'Гид рассказал столько всего интересного, что время пролетело незаметно.',
    'Историческая ценность огромная, но указателей маловато. Берите экскурсию.',
    'Спокойная атмосфера, минимум туристов в будний день. Рекомендую.',
    'Шикарные виды, особенно на закате. Готовьте камеру заранее.',
    'Не пожалели, что заехали. Живая история Псковщины во всей красе.',
    'Хорошая инфраструктура: парковка есть, кафе рядом. Чисто и ухожено.',
    'Не самое раскрученное место, но именно поэтому особенно атмосферно.',
    'Очень рекомендую любителям истории и архитектуры. Один из must-see региона.',
    'Долго добирались, но место стоило этого. Обязательно вернёмся весной.',
    'Удивительное сочетание природы и старинных построек. Душа отдыхает.',
    'Понравилось всё, кроме очередей в выходные. Лучше приезжать рано утром.',
    'Спасибо смотрителям за порядок и тёплый приём. Отдельный плюс.'
  ];
  ratings integer[] := array[5,5,4,5,5,3,4,5,5,4,5,4,5,3,5,4,5,5,2,4,5,5,4,5];
  ai integer;
  ti integer;
  ri integer;
  status_choice text;
  i integer;
  attraction_idx integer := 0;
  total integer := 0;
begin
  if exists (select 1 from public.reviews where user_email like '%@test2.local') then
    raise notice 'Bulk test reviews already seeded, skipping.';
    return;
  end if;

  for rec in
    select id, district_id from public.attractions
    order by created_at asc
    offset 0 limit 5
  loop
    attraction_idx := attraction_idx + 1;
    for i in 1..10 loop
      total := total + 1;
      ai := ((total - 1) % array_length(authors, 1)) + 1;
      ti := ((total * 3 + attraction_idx) % array_length(texts, 1)) + 1;
      ri := ((total * 7 + attraction_idx * 2) % array_length(ratings, 1)) + 1;
      -- 70% approved, 30% pending — predictable pattern via modulo so the
      -- mix is the same on every reseed.
      status_choice := case when total % 10 < 7 then 'approved' else 'pending' end;

      insert into public.reviews (
        attraction_id, district_id, author_name, user_email,
        rating, text, status_id, photo_urls, created_at
      ) values (
        rec.id,
        rec.district_id,
        authors[ai] || ' #' || total,
        'bulk' || total || '@test2.local',
        ratings[ri],
        texts[ti],
        status_choice,
        '{}',
        now() - (total || ' hours')::interval
      );
    end loop;
  end loop;

  raise notice 'Seeded % bulk test reviews across % attractions.', total, attraction_idx;
end$$;
