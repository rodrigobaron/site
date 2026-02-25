// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'

import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'
import { Bleed } from 'nextra/components'
import { PostsGrid } from './PostsGrid'

async function getPosts() {
  const { directories } = normalizePages({
    list: await getPageMap('/posts'),
    route: '/posts'
  })
  return directories
    .filter(post => post.name !== 'index')
    .sort((a, b) => new Date(b.frontMatter.date) - new Date(a.frontMatter.date))
}

function formatDate(dateStr, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return new Date(dateStr).toLocaleDateString('en-US', opts)
}

export const metadata = {
  title: 'Posts'
}

export async function PostsPage() {
  const allposts = await getPosts()
  const tags = allposts.flatMap(post => post.frontMatter.tags)

  const allTags: Record<string, number> = {}
  for (const tag of tags) {
    allTags[tag] ??= 0
    allTags[tag] += 1
  }

  const featured = allposts[0]
  const rest = allposts.slice(1)

  return (
    <Bleed>

      {/* ── LATEST (featured post) ── */}
      <div className='section-header'>
        <span className='section-label'>Latest</span>
      </div>
      <Link href={featured.route ?? '/404'} className='featured-card'>
        <div className='featured-visual'>
          {featured.frontMatter.thumbnail ? (
            <Image
              src={featured.frontMatter.thumbnail}
              alt={featured.title}
              fill
              className='featured-thumb-img'
            />
          ) : (
            <div className='featured-glow' />
          )}
          <span className='featured-badge'>
            / {featured.frontMatter.tags?.slice(0, 2).join(' · ')}
          </span>
        </div>
        <div className='featured-body'>
          <div>
            <div className='featured-tag'>{featured.frontMatter.tags?.[0]}</div>
            <div className='featured-title'>{featured.title}</div>
            <p className='featured-excerpt'>{featured.frontMatter.description}</p>
          </div>
          <div className='featured-meta'>
            <span>{formatDate(featured.frontMatter.date)}</span>
            <span>→ read</span>
          </div>
        </div>
      </Link>

      {/* ── TOPICS + GRID (client-side filtering) ── */}
      <PostsGrid posts={rest} allTags={allTags} />

    </Bleed>
  )
}
