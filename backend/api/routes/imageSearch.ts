import { Router } from 'express'
import passport from 'passport'
import jwtStrategy from '../auth/jwtStrategy.ts'
import logger from '../logger.ts'

const router = Router()

const authenticateJwt = passport.authenticate(jwtStrategy, { session: false })

router.use(authenticateJwt)

// Search Creative Commons images via Wikimedia Commons API
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query as string

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    const url = new URL('https://commons.wikimedia.org/w/api.php')
    url.searchParams.set('action', 'query')
    url.searchParams.set('generator', 'search')
    url.searchParams.set('gsrnamespace', '6') // File namespace
    url.searchParams.set('gsrsearch', query)
    url.searchParams.set('gsrlimit', '12')
    url.searchParams.set('prop', 'imageinfo')
    url.searchParams.set('iiprop', 'url|extmetadata|mime')
    url.searchParams.set('iiurlwidth', '300') // Thumbnail width
    url.searchParams.set('format', 'json')
    url.searchParams.set('origin', '*')

    const response = await fetch(url.toString())
    const data = await response.json()

    if (!data.query || !data.query.pages) {
      return res.json({ results: [] })
    }

    const results = Object.values(data.query.pages)
      .filter((page: any) => {
        const mime = page.imageinfo?.[0]?.mime || ''
        return mime.startsWith('image/')
      })
      .map((page: any) => {
        const info = page.imageinfo?.[0]
        const metadata = info?.extmetadata || {}

        return {
          title: page.title?.replace('File:', '') || '',
          url: info?.url || '',
          thumbnailUrl: info?.thumburl || info?.url || '',
          license: metadata.LicenseShortName?.value || 'Unknown',
          source: 'Wikimedia Commons',
        }
      })

    res.json({ results })
  } catch (err) {
    logger.error('Failed to search images', { error: err })
    res.status(500).json({ error: 'Failed to search images' })
  }
})

export default router
