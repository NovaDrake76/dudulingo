import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { seed } from './fixtures.ts'
import * as schema from './schema.ts'

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const db = drizzle(pool, { schema })

  await seed(db)

  console.log('Database has been seeded successfully.')
  await pool.end()
  process.exit(0)
}

main().catch((err) => {
  console.error('Error seeding database:', err)
  process.exit(1)
})
