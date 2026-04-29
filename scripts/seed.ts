/**
 * Seed Supabase with districts (metadata) and attractions (from CSV).
 * Run: npm run seed
 *
 * Reads .env for SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL.
 * Idempotent: upserts by primary key.
 */
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

// District metadata — kept here so seed has no runtime deps on src/
const DISTRICTS: Array<{ id: string; name: string; coat_url: string; description?: string }> = [
  { id: 'bezhanitsky',       name: 'Бежаницкий район',         coat_url: '/coats/coat_bezhanitsky.png' },
  { id: 'velikoluksky',      name: 'Великолукский район',      coat_url: '/coats/coat_velikoluksky.png' },
  { id: 'gdovsky',           name: 'Гдовский район',           coat_url: '/coats/coat_gdovsky.png' },
  { id: 'dedovichsky',       name: 'Дедовичский район',        coat_url: '/coats/coat_dedovichsky.png' },
  { id: 'dnovsky',           name: 'Дновский район',           coat_url: '/coats/coat_dnovsky.png' },
  { id: 'krasnogorodsky',    name: 'Красногородский район',    coat_url: '/coats/coat_krasnogrodsky.png' },
  { id: 'kuninsky',          name: 'Куньинский район',         coat_url: '/coats/coat_kuninsky.png' },
  { id: 'loknyansky',        name: 'Локнянский район',         coat_url: '/coats/coat_loknyansky.png' },
  { id: 'nevelsky',          name: 'Невельский район',         coat_url: '/coats/coat_nevelsky.png' },
  { id: 'novorzhevsky',      name: 'Новоржевский район',       coat_url: '/coats/coat_novorzhevsky.png' },
  { id: 'novosokolnichesky', name: 'Новосокольнический район', coat_url: '/coats/coat_novosokolnichesky.png' },
  { id: 'opochny',           name: 'Опочецкий район',          coat_url: '/coats/coat_opochny.png' },
  { id: 'ostrovsky',         name: 'Островский район',         coat_url: '/coats/coat_ostrovsky.png' },
  { id: 'palkinsky',         name: 'Палкинский район',         coat_url: '/coats/coat_palkinsky.png' },
  { id: 'pechorsky',         name: 'Печорский район',          coat_url: '/coats/coat_pechorsky.png' },
  { id: 'plussky',           name: 'Плюсский район',           coat_url: '/coats/coat_plussky.png' },
  { id: 'porhovsky',         name: 'Порховский район',         coat_url: '/coats/coat_porhovsky.png' },
  { id: 'pskovsky',          name: 'Псковский район',          coat_url: '/coats/coat_pskovsky.png' },
  { id: 'pustoshkinsky',     name: 'Пустошкинский район',      coat_url: '/coats/coat_pustoshkinsky.png' },
  { id: 'pushkinogorsky',    name: 'Пушкиногорский район',     coat_url: '/coats/coat_pushkinogorsky.png' },
  { id: 'pytalovsky',        name: 'Пыталовский район',        coat_url: '/coats/coat_pytalovsky.png' },
  { id: 'sebezhsky',         name: 'Себежский район',          coat_url: '/coats/coat_sebezhsky.png' },
  { id: 'strugo_krasnensky', name: 'Струго-Красненский район', coat_url: '/coats/coat_strugo-krasnensky.png' },
  { id: 'usvyatsky',         name: 'Усвятский район',          coat_url: '/coats/coat_usvyatsky.png' },
  { id: 'pskov',             name: 'Псков',                    coat_url: '/coats/coat_pskov.png' },
  { id: 'velikieluki',       name: 'Великие Луки',             coat_url: '/coats/coat_velikieluki.png' },
];

interface CsvRow {
  id: string;
  district_id: string;
  title: string;
  description: string;
  image_url: string;
  lng: string;
  lat: string;
  sort_order: string;
  created_at: string;
}

async function seedDistricts() {
  console.log(`Upserting ${DISTRICTS.length} districts...`);
  const { error } = await supabase.from('districts').upsert(DISTRICTS, { onConflict: 'id' });
  if (error) throw error;
  console.log('  ✓ districts done');
}

async function seedAttractions() {
  const csvPath = path.join(ROOT, 'attractions_rows.csv');
  const raw = readFileSync(csvPath, 'utf-8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true }) as CsvRow[];

  const records = rows.map((r) => ({
    id: r.id,
    district_id: r.district_id,
    title: r.title,
    description: r.description || null,
    image_url: r.image_url || null,
    lng: r.lng ? Number(r.lng) : null,
    lat: r.lat ? Number(r.lat) : null,
    sort_order: r.sort_order ? Number(r.sort_order) : 0,
  }));

  console.log(`Upserting ${records.length} attractions...`);
  const { error } = await supabase.from('attractions').upsert(records, { onConflict: 'id' });
  if (error) throw error;
  console.log('  ✓ attractions done');
}

async function main() {
  await seedDistricts();
  await seedAttractions();
  console.log('\nSeed complete.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
