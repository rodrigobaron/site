// @ts-nocheck
import { Bleed } from 'nextra/components'
import { getPosts } from '../lib/posts'

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
      <div>
        <span className='hero-eyebrow'>
          <span className='blink'>█</span>
          connected · ml engineering log
        </span>

        <h1>
          Building, optimizing, and serving <em>machine learning systems</em> at scale.
        </h1>

        <p className='hero-sub'>
          A working log on the moving parts of production ML — inference servers,
          quantization, fine-tuning, evaluation, and the trade-offs you only learn
          by shipping.
        </p>

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

      <div className='hero-visual'>
        <span className='hero-visual-corner'>node.graph / v0.4</span>
        <span className='hero-visual-corner-r'>● LIVE</span>
        <svg viewBox='0 0 200 200' fill='none'>
          <g stroke='#00CCCC' strokeOpacity='0.55' strokeWidth='0.6'>
            <line x1='40' y1='40' x2='100' y2='60'/>
            <line x1='40' y1='40' x2='100' y2='100'/>
            <line x1='40' y1='40' x2='100' y2='140'/>
            <line x1='40' y1='100' x2='100' y2='60'/>
            <line x1='40' y1='100' x2='100' y2='100'/>
            <line x1='40' y1='100' x2='100' y2='140'/>
            <line x1='40' y1='160' x2='100' y2='60'/>
            <line x1='40' y1='160' x2='100' y2='100'/>
            <line x1='40' y1='160' x2='100' y2='140'/>
            <line x1='100' y1='60' x2='160' y2='80'/>
            <line x1='100' y1='60' x2='160' y2='120'/>
            <line x1='100' y1='100' x2='160' y2='80'/>
            <line x1='100' y1='100' x2='160' y2='120'/>
            <line x1='100' y1='140' x2='160' y2='80'/>
            <line x1='100' y1='140' x2='160' y2='120'/>
          </g>
          <g fill='#CCCCCC'>
            <circle cx='40' cy='40' r='3.5'/>
            <circle cx='40' cy='100' r='3.5'/>
            <circle cx='40' cy='160' r='3.5'/>
            <circle cx='100' cy='60' r='3.5'/>
            <circle cx='100' cy='140' r='3.5'/>
            <circle cx='160' cy='80' r='3.5'/>
          </g>
          <g fill='#00FFFF'>
            <circle cx='100' cy='100' r='5'/>
            <circle cx='160' cy='120' r='4'/>
          </g>
        </svg>
      </div>
    </section>
    </Bleed>
  )
}
