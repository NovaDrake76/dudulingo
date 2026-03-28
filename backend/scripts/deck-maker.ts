import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface DeckInput {
  deckName: string
  deckDescription: string
  lang: string
  words: { prompt: string; answer: string }[]
}

interface CardData {
  type: 'basic'
  level: number
  prompt: string
  answer: string
  lang: string
  imageUrl: string
  imageSource: string
  imageLicense: string
  audioUrl: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchWikimediaImage(
  query: string
): Promise<{ url: string; license: string } | null> {
  try {
    const apiUrl = new URL('https://commons.wikimedia.org/w/api.php')
    apiUrl.searchParams.set('action', 'query')
    apiUrl.searchParams.set('generator', 'search')
    apiUrl.searchParams.set('gsrnamespace', '6')
    apiUrl.searchParams.set('gsrsearch', `${query} photo`)
    apiUrl.searchParams.set('gsrlimit', '5')
    apiUrl.searchParams.set('prop', 'imageinfo')
    apiUrl.searchParams.set('iiprop', 'url|extmetadata|mime')
    apiUrl.searchParams.set('iiurlwidth', '400')
    apiUrl.searchParams.set('format', 'json')
    apiUrl.searchParams.set('origin', '*')

    const resp = await fetch(apiUrl.toString())
    const data = await resp.json()

    if (!data.query?.pages) return null

    const pages = Object.values(data.query.pages) as any[]
    const good = pages.find((p: any) => {
      const mime = p.imageinfo?.[0]?.mime || ''
      return mime.startsWith('image/') && mime !== 'image/svg+xml'
    })

    if (!good) return null

    const info = good.imageinfo[0]
    const license = info.extmetadata?.LicenseShortName?.value || 'CC'

    return {
      url: info.thumburl || info.url,
      license,
    }
  } catch (e) {
    console.error(`  [WARN] Image fetch failed for "${query}":`, e)
    return null
  }
}

function getAudioUrl(word: string): string {
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(word.toLowerCase())}`
}

async function processDeck(inputPath: string): Promise<{ deck: { name: string; description: string }; cards: CardData[] }> {
  const raw = fs.readFileSync(inputPath, 'utf-8')
  const input: DeckInput = JSON.parse(raw)

  console.log(`\n🃏 Processing deck: ${input.deckName} (${input.words.length} words)`)

  const cards: CardData[] = []

  for (let i = 0; i < input.words.length; i++) {
    const word = input.words[i]
    console.log(`  [${i + 1}/${input.words.length}] ${word.prompt} → ${word.answer}`)

    const image = await fetchWikimediaImage(word.answer)

    if (!image) {
      console.log(`    ⚠ No image found, skipping image`)
    }

    cards.push({
      type: 'basic',
      level: 1,
      prompt: word.prompt,
      answer: word.answer,
      lang: input.lang,
      imageUrl: image?.url || '',
      imageSource: image ? 'Wikimedia Commons' : '',
      imageLicense: image?.license || '',
      audioUrl: getAudioUrl(word.answer),
    })

    // Rate limit: 200ms between API calls
    if (i < input.words.length - 1) await sleep(200)
  }

  return {
    deck: { name: input.deckName, description: input.deckDescription },
    cards,
  }
}

async function seedToDb(results: { deck: { name: string; description: string }; cards: CardData[] }[]) {
  // Dynamic import to handle the DB connection
  const { default: connectDB } = await import('../api/db/index.ts')
  const { Card, Deck, User } = await import('../api/db/schema.ts')

  await connectDB()

  // Get first user as owner (or create a system user)
  let owner = await User.findOne()
  if (!owner) {
    owner = await User.create({ name: 'System', providerId: 'system|0' })
  }

  for (const result of results) {
    console.log(`\n💾 Seeding: ${result.deck.name}`)

    // Check if deck already exists
    const existing = await Deck.findOne({ name: result.deck.name })
    if (existing) {
      console.log(`  ⏭ Deck "${result.deck.name}" already exists, skipping`)
      continue
    }

    const createdCards = await Card.insertMany(result.cards)
    console.log(`  ✅ Created ${createdCards.length} cards`)

    const deck = await Deck.create({
      name: result.deck.name,
      description: result.deck.description,
      ownerId: owner._id,
      cards: createdCards.map((c: any) => c._id),
    })
    console.log(`  ✅ Created deck: ${deck.name} (${deck._id})`)
  }

  console.log('\n🎉 Seeding complete!')
  process.exit(0)
}

async function main() {
  const args = process.argv.slice(2)
  const shouldSeed = args.includes('--seed')
  const inputFiles = args.filter((a) => !a.startsWith('--'))

  let files: string[]

  if (inputFiles.length > 0) {
    files = inputFiles.map((f) => path.resolve(f))
  } else {
    // Default: process all JSON files in scripts/decks/
    const decksDir = path.join(__dirname, 'decks')
    files = fs.readdirSync(decksDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => path.join(decksDir, f))
  }

  if (files.length === 0) {
    console.error('No input files found. Place JSON files in scripts/decks/ or pass them as arguments.')
    process.exit(1)
  }

  console.log(`📦 Deck Maker - Processing ${files.length} deck(s)...`)

  const results = []
  for (const file of files) {
    const result = await processDeck(file)
    results.push(result)
  }

  if (shouldSeed) {
    await seedToDb(results)
  } else {
    // Output as JSON
    const outputPath = path.join(__dirname, 'generated-decks.json')
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8')
    console.log(`\n📄 Output written to: ${outputPath}`)
    console.log('Run with --seed to insert directly into MongoDB.')
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
