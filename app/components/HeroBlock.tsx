// @ts-nocheck
import { Bleed } from 'nextra/components'
import { getPosts } from '../lib/posts'
import { HeroPanel } from './HeroPanel'

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function getStats() {
  const posts = await getPosts()
  const topics = new Set<string>()
  let lastDate: Date | null = null
  for (const p of posts) {
    for (const t of p.frontMatter?.tags ?? []) topics.add(t)
    const d = p.frontMatter?.date ? new Date(p.frontMatter.date) : null
    if (d && (!lastDate || d > lastDate)) lastDate = d
  }
  return {
    postsCount: posts.length,
    topicsCount: topics.size,
    lastSync: lastDate ? fmt(lastDate) : '—',
  }
}


export async function HeroBlock() {
  const { postsCount, topicsCount, lastSync } = await getStats()

  return (
    <Bleed>
    <section className='hero hero-block'>
      {/* post-hero style backdrop: drifting grid + breathing glow */}
      <div className='hero-bg' aria-hidden='true'>
        <div className='hero-bg-glow' />
        <div className='hero-bg-glow hero-bg-glow-2' />
        <div className='hero-bg-grid' />
      </div>

      <div className='hero-main'>
        <div className='hero-copy'>
          <span className='hero-eyebrow'>
            <span className='prompt-sign'>$</span>
            <span className='typed'>tail -f ~/ml-notes.log</span>
            <span className='caret'>█</span>
          </span>

          <h1>
            Building, optimizing, and serving <em>machine learning systems</em> at scale.
          </h1>

          <p className='hero-sub'>
            Working notes on building and running ML systems in production: serving,
            quantization, fine-tuning and evaluation.
          </p>

          <div className='hero-cta'>
            <a href='#latest' className='btn-terminal'>browse notes ►</a>
            <a href='https://github.com/rodrigobaron' className='btn-ghost' target='_blank' rel='noreferrer'>github ↗</a>
          </div>

          <div className='hero-stats'>
            <div className='stat-block'>
              <div className='stat-label'>posts</div>
              <div className='stat-value'>{postsCount}</div>
            </div>
            <div className='stat-block'>
              <div className='stat-label'>topics</div>
              <div className='stat-value'>{topicsCount}</div>
            </div>
            <div className='stat-block'>
              <div className='stat-label'>last_sync</div>
              <div className='stat-value'>{lastSync}</div>
            </div>
          </div>
        </div>

        <HeroPanel />
      </div>
    </section>
    </Bleed>
  )
}
