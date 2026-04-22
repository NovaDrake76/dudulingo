/**
 * Downloads one CC0 image per visual concept from Openverse, writes it to
 * frontend/assets/cards/<key>.jpg, and emits assets/cards/index.ts mapping
 * keys → require()'d image modules + attribution.
 *
 * Run from frontend/:  node --import tsx/esm scripts/fetch-card-images.ts
 *
 * Idempotent: skips concepts whose image already exists. Pass --force to
 * re-download everything.
 */

import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const FORCE = process.argv.includes('--force');

const ROOT = path.resolve(process.cwd());
const CARDS_DIR = path.join(ROOT, 'assets', 'cards');
const ATTRIB_PATH = path.join(CARDS_DIR, 'attributions.json');
const INDEX_PATH = path.join(CARDS_DIR, 'index.ts');

if (!existsSync(CARDS_DIR)) mkdirSync(CARDS_DIR, { recursive: true });

interface Concept {
  key: string; // file name without extension
  query: string; // Openverse search term
}

// One image per concept — shared across all languages (a cat is a cat).
const CONCEPTS: Concept[] = [
  // animals
  { key: 'dog', query: 'dog' },
  { key: 'cat', query: 'cat' },
  { key: 'lion', query: 'lion' },
  { key: 'tiger', query: 'tiger' },
  { key: 'elephant', query: 'elephant' },
  { key: 'monkey', query: 'monkey' },
  { key: 'giraffe', query: 'giraffe' },
  { key: 'zebra', query: 'zebra' },
  { key: 'bear', query: 'brown bear' },
  { key: 'bird', query: 'songbird' },
  { key: 'fish', query: 'fish underwater' },
  { key: 'horse', query: 'horse' },
  { key: 'rabbit', query: 'rabbit' },
  { key: 'cow', query: 'cow' },
  { key: 'sheep', query: 'sheep' },
  // travel — concrete only
  { key: 'water', query: 'glass of water' },
  { key: 'food', query: 'plate of food' },
  { key: 'bathroom', query: 'restroom sign' },
  { key: 'airport', query: 'airport terminal' },
  { key: 'hotel', query: 'hotel building' },
  { key: 'train', query: 'train station' },
  { key: 'taxi', query: 'taxi cab' },
  { key: 'police', query: 'police officer' },
  { key: 'hospital', query: 'hospital building' },
  { key: 'morning', query: 'sunrise sky' },
  { key: 'night', query: 'night moon' },
  { key: 'money', query: 'coins money' },
];

interface OpenverseHit {
  id: string;
  url: string;
  thumbnail?: string;
  title: string;
  creator?: string;
  creator_url?: string;
  license: string;
  license_version?: string;
  foreign_landing_url?: string;
}

interface Attribution {
  key: string;
  source: string; // landing URL on the original site
  thumbUrl: string; // openverse thumb URL
  title: string;
  creator: string;
  license: string;
}

async function searchCC0(query: string): Promise<OpenverseHit[]> {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license=cc0&page_size=10&filter_dead=true`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Dudulingo/1.0 image-fetcher' } });
  if (!res.ok) {
    console.error(`  openverse ${res.status} for "${query}"`);
    return [];
  }
  const data = (await res.json()) as { results: OpenverseHit[] };
  return data.results ?? [];
}

const MAX_BYTES = 150 * 1024; // 150 KB per card image

/** Returns the saved path (with the correct extension) or null. */
async function downloadImage(
  hit: OpenverseHit,
  destBase: string,
): Promise<{ path: string; size: number } | null> {
  // Try the openverse thumb endpoint first (~40 KB). On 424/429/5xx fall back
  // to the direct image URL. Reject anything larger than MAX_BYTES — APK budget.
  // Detect the actual format (jpeg vs webp vs png) from the response and pick
  // the right file extension so metro's asset bundler doesn't choke on a
  // misnamed file.
  const candidates = [
    `https://api.openverse.org/v1/images/${hit.id}/thumb/`,
    hit.thumbnail,
    hit.url,
  ].filter(Boolean) as string[];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Dudulingo/1.0 image-fetcher' },
      });
      if (!res.ok || !res.body) continue;

      const ct = (res.headers.get('content-type') ?? '').toLowerCase();
      const ext =
        ct.includes('webp') ? '.webp'
        : ct.includes('png') ? '.png'
        : ct.includes('jpeg') || ct.includes('jpg') ? '.jpg'
        : url.endsWith('.png') ? '.png'
        : url.endsWith('.webp') ? '.webp'
        : '.jpg';

      const dest = `${destBase}${ext}`;
      const file = createWriteStream(dest);
      await pipeline(Readable.fromWeb(res.body as any), file);
      const size = statSync(dest).size;
      if (size > MAX_BYTES) continue;
      return { path: dest, size };
    } catch {
      continue;
    }
  }
  return null;
}

async function main() {
  console.log(`Fetching ${CONCEPTS.length} concept images to ${CARDS_DIR}`);
  const attributions: Attribution[] = existsSync(ATTRIB_PATH)
    ? (JSON.parse(readFileSync(ATTRIB_PATH, 'utf8')) as Attribution[])
    : [];
  const attribByKey = new Map(attributions.map((a) => [a.key, a]));

  const conceptToExt = new Map<string, string>();

  for (const c of CONCEPTS) {
    const destBase = path.join(CARDS_DIR, c.key);
    const existingExt = ['.jpg', '.png', '.webp'].find((e) =>
      existsSync(`${destBase}${e}`),
    );
    if (existingExt && !FORCE) {
      console.log(`  skip ${c.key} (already present as ${existingExt})`);
      conceptToExt.set(c.key, existingExt);
      continue;
    }
    console.log(`  fetch ${c.key} ("${c.query}")`);
    const hits = await searchCC0(c.query);
    if (hits.length === 0) {
      console.error(`    no results`);
      continue;
    }

    let chosen: OpenverseHit | null = null;
    let saved: { path: string; size: number } | null = null;
    for (const hit of hits) {
      saved = await downloadImage(hit, destBase);
      if (saved) {
        chosen = hit;
        break;
      }
    }
    if (!chosen || !saved) {
      console.error(`    every candidate failed`);
      continue;
    }

    const ext = path.extname(saved.path);
    conceptToExt.set(c.key, ext);
    attribByKey.set(c.key, {
      key: c.key,
      source: chosen.foreign_landing_url ?? chosen.url,
      thumbUrl: `https://api.openverse.org/v1/images/${chosen.id}/thumb/`,
      title: chosen.title,
      creator: chosen.creator ?? 'Unknown',
      license: `${chosen.license} ${chosen.license_version ?? ''}`.trim(),
    });
    console.log(`    saved ${path.basename(saved.path)} (${(saved.size / 1024).toFixed(1)} KB)  · ${chosen.creator}`);
  }

  const finalAttribs = CONCEPTS.map((c) => attribByKey.get(c.key)).filter(Boolean) as Attribution[];
  writeFileSync(ATTRIB_PATH, JSON.stringify(finalAttribs, null, 2));

  // Emit index.ts mapping concept keys to require()'d modules.
  const lines: string[] = [
    '// AUTO-GENERATED by frontend/scripts/fetch-card-images.ts',
    '// Do not edit by hand.',
    '',
    'import type { ImageSourcePropType } from "react-native";',
    '',
    'export const CARD_IMAGES: Record<string, ImageSourcePropType> = {',
  ];
  for (const c of CONCEPTS) {
    const ext = conceptToExt.get(c.key);
    if (!ext) continue;
    lines.push(`  ${JSON.stringify(c.key)}: require("./${c.key}${ext}"),`);
  }
  lines.push('};', '');
  writeFileSync(INDEX_PATH, lines.join('\n'));

  console.log(`wrote ${INDEX_PATH}`);
  console.log(`wrote ${ATTRIB_PATH} (${finalAttribs.length} entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
