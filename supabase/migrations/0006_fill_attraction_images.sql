-- =====================================================================
-- Fill in missing image_url for attractions, matching files that already
-- exist in public/images/. Each UPDATE only touches the row if image_url
-- is currently NULL — running again is safe.
-- =====================================================================

update public.attractions set image_url = '/images/S. V. Kovalevskaya_Memorial_Estate_Museum.jpg'
  where id = '006d5221-dc26-4468-a995-9bdd38f7f06e' and image_url is null;

update public.attractions set image_url = '/images/Izborsk_fortress.jpg'
  where id = '04b540c7-3cda-4879-a95d-308aa18e23a9' and image_url is null;

update public.attractions set image_url = '/images/Pskov_Planetarium.jpg'
  where id = '05968c67-5d06-4bd7-bce4-da83c0f41ceb' and image_url is null;

update public.attractions set image_url = '/images/M. P. Mussorgsky_Estate_Museum.jpg'
  where id = '097cb521-2057-48cf-83a0-cd0e8e6041cc' and image_url is null;

update public.attractions set image_url = '/images/Mikhailovskoye_Estate_Museum.jpg'
  where id = '2487832c-44cc-45a3-9c8d-fc6428a994e1' and image_url is null;

update public.attractions set image_url = '/images/Pskov_Puppet_Theater.jpg'
  where id = '2ba541fa-7891-4225-800f-6b677c02354a' and image_url is null;

update public.attractions set image_url = '/images/N. A. Rimsky-Korsakov Memorial Estate Museum.jpg'
  where id = '3245968b-4d7c-4cd9-9fd1-ccb53273ad1b' and image_url is null;

update public.attractions set image_url = '/images/Sebezhsky_National_Park.jpg'
  where id = '40eda15b-54e2-4cf3-b4ff-56351bdeb4e7' and image_url is null;

update public.attractions set image_url = '/images/Krypetskiy_monastyr.jpg'
  where id = '54e4d3f3-d7e0-4310-8adc-7f1e6be039bc' and image_url is null;

update public.attractions set image_url = '/images/Porkhovskaya_fortress.jpg'
  where id = '5dd86fd7-1802-4308-ac28-691c2035ed7a' and image_url is null;

update public.attractions set image_url = '/images/Trutnevskaya_cave.jpg'
  where id = '63213e87-9037-4ab8-8c46-bd23a6f6ac44' and image_url is null;

update public.attractions set image_url = '/images/Pskov_Caves_Monastery.jpg'
  where id = '7d10009d-6845-4408-a305-b9a374f4bc1c' and image_url is null;

update public.attractions set image_url = '/images/The_Rattling_Tower.jpg'
  where id = '8f544df4-a9a2-4321-9e86-52e2c433cf64' and image_url is null;

update public.attractions set image_url = '/images/The_Olgin_Chapel.jpg'
  where id = 'a83e703d-5da9-403e-a04a-715ffb23af91' and image_url is null;

update public.attractions set image_url = '/images/Pskov_Drama_Theatre.jpg'
  where id = 'c690bedd-8c21-43a9-8973-8c67a15e7a0b' and image_url is null;

update public.attractions set image_url = '/images/The_Ice_Battle_Monument.jpg'
  where id = 'cf169403-506a-446e-8710-78da04768d2e' and image_url is null;

update public.attractions set image_url = '/images/Talab_Islands.jpg'
  where id = 'd46a8a47-43e6-45ff-8277-027f14b2dccb' and image_url is null;

update public.attractions set image_url = '/images/Slovenian_keys.jpg'
  where id = 'f2b673bf-129d-452c-a321-20cb9c1dc9e3' and image_url is null;

update public.attractions set image_url = '/images/monument_to_Princess_Olga.jpg'
  where id = 'f4fee411-b15a-4544-a814-ebe774828675' and image_url is null;

update public.attractions set image_url = '/images/Nikandrova_deserts.webp'
  where id = 'fd7371cf-7db8-4f4c-a2f2-493b13e6682f' and image_url is null;

update public.attractions set image_url = '/images/Snetogorsky_Monastery.jpg'
  where id = 'ffd65a42-12b6-4204-8d39-d434fe371a7f' and image_url is null;

-- 630e1966-... (Музей-усадьба народа сето, Печорский) — нет подходящего
-- файла в public/images/, оставляем как NULL до загрузки картинки.
