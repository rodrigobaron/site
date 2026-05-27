import fs from 'node:fs/promises'
import path from 'node:path'

const POSTS_DIR = path.join(process.cwd(), 'app', 'posts')
const POST_GROUPS = ['', '(with-comments)']
const PROSE_WPM = 200
const SECONDS_PER_CODE_LINE = 10

const cache = new Map<string, number>()

async function readMdx(name: string): Promise<string | null> {
  for (const group of POST_GROUPS) {
    try {
      return await fs.readFile(path.join(POSTS_DIR, group, name, 'page.mdx'), 'utf-8')
    } catch {}
  }
  return null
}

function estimateMinutes(mdx: string): number {
  const noFrontmatter = mdx.replace(/^---[\s\S]*?\n---\n?/, '')

  let codeLines = 0
  const proseSrc = noFrontmatter.replace(/```[\s\S]*?```/g, block => {
    const inner = block.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')
    codeLines += inner.split('\n').filter(l => l.trim().length > 0).length
    return ' '
  })

  const prose = proseSrc
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/^import\s.+$/gm, ' ')
    .replace(/^export\s.+$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~>|`]/g, ' ')

  const proseWords = prose.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(proseWords / PROSE_WPM + (codeLines * SECONDS_PER_CODE_LINE) / 60))
}

export async function readingMinutes(name: string): Promise<number> {
  const cached = cache.get(name)
  if (cached !== undefined) return cached
  const raw = await readMdx(name)
  const minutes = raw ? estimateMinutes(raw) : 1
  cache.set(name, minutes)
  return minutes
}
