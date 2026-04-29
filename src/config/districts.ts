import type { DistrictId } from '@/types';

/**
 * Mapping between district slug (used in DB and CSV) and the Russian name
 * found in `public/geo/pskov-districts.geojson` (`properties.district`).
 *
 * Keep in sync with the geojson file: each name here MUST match an existing
 * feature exactly, otherwise hover/click on the map won't link to DB rows.
 */
export const DISTRICTS: Record<DistrictId, { name: string; coat: string }> = {
  bezhanitsky:        { name: 'Бежаницкий район',         coat: '/coats/coat_bezhanitsky.png' },
  velikoluksky:       { name: 'Великолукский район',      coat: '/coats/coat_velikoluksky.png' },
  gdovsky:            { name: 'Гдовский район',           coat: '/coats/coat_gdovsky.png' },
  dedovichsky:        { name: 'Дедовичский район',        coat: '/coats/coat_dedovichsky.png' },
  dnovsky:            { name: 'Дновский район',           coat: '/coats/coat_dnovsky.png' },
  krasnogorodsky:     { name: 'Красногородский район',    coat: '/coats/coat_krasnogrodsky.png' },
  kuninsky:           { name: 'Куньинский район',         coat: '/coats/coat_kuninsky.png' },
  loknyansky:         { name: 'Локнянский район',         coat: '/coats/coat_loknyansky.png' },
  nevelsky:           { name: 'Невельский район',         coat: '/coats/coat_nevelsky.png' },
  novorzhevsky:       { name: 'Новоржевский район',       coat: '/coats/coat_novorzhevsky.png' },
  novosokolnichesky:  { name: 'Новосокольнический район', coat: '/coats/coat_novosokolnichesky.png' },
  opochny:            { name: 'Опочецкий район',          coat: '/coats/coat_opochny.png' },
  ostrovsky:          { name: 'Островский район',         coat: '/coats/coat_ostrovsky.png' },
  palkinsky:          { name: 'Палкинский район',         coat: '/coats/coat_palkinsky.png' },
  pechorsky:          { name: 'Печорский район',          coat: '/coats/coat_pechorsky.png' },
  plussky:            { name: 'Плюсский район',           coat: '/coats/coat_plussky.png' },
  porhovsky:          { name: 'Порховский район',         coat: '/coats/coat_porhovsky.png' },
  pskovsky:           { name: 'Псковский район',          coat: '/coats/coat_pskovsky.png' },
  pustoshkinsky:      { name: 'Пустошкинский район',      coat: '/coats/coat_pustoshkinsky.png' },
  pushkinogorsky:     { name: 'Пушкиногорский район',     coat: '/coats/coat_pushkinogorsky.png' },
  pytalovsky:         { name: 'Пыталовский район',        coat: '/coats/coat_pytalovsky.png' },
  sebezhsky:          { name: 'Себежский район',          coat: '/coats/coat_sebezhsky.png' },
  strugo_krasnensky:  { name: 'Струго-Красненский район', coat: '/coats/coat_strugo-krasnensky.png' },
  usvyatsky:          { name: 'Усвятский район',          coat: '/coats/coat_usvyatsky.png' },
  pskov:              { name: 'Псков',                    coat: '/coats/coat_pskov.png' },
  velikieluki:        { name: 'Великие Луки',             coat: '/coats/coat_velikieluki.png' },
};

/**
 * Reverse lookup: Russian name from geojson → slug.
 * Aliases handle cases where the geojson uses an older/abbreviated label
 * but the DB and UI consistently use the canonical name.
 */
const ALIASES: Record<string, DistrictId> = {
  Луки: 'velikieluki',
};

export const DISTRICT_BY_NAME: Record<string, DistrictId> = {
  ...Object.fromEntries(
    Object.entries(DISTRICTS).map(([id, { name }]) => [name, id as DistrictId]),
  ),
  ...ALIASES,
} as Record<string, DistrictId>;

/** Approximate map center on Pskov city */
export const PSKOV_CENTER: [number, number] = [28.34, 57.82];
