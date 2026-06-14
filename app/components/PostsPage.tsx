// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'

import { Bleed } from 'nextra/components'
import { PostsGrid } from './PostsGrid'
import { getPostsByDateDesc } from '../lib/posts'
import { formatDate } from '../lib/format'

export const metadata = {
  title: 'Posts'
}

export async function PostsPage() {
  const allposts = await getPostsByDateDesc()
  const tags = allposts.flatMap(post => post.frontMatter.tags)

  const allTags: Record<string, number> = {}
  for (const tag of tags) {
    allTags[tag] ??= 0
    allTags[tag] += 1
  }

  const featured = allposts[0]
  const rest = allposts.slice(1)
  const featuredDate = featured.frontMatter.date
    ? new Date(featured.frontMatter.date).toISOString().slice(0, 10)
    : ''
  const featuredSlug = featured.route?.split('/').filter(Boolean).pop() ?? 'note'

  return (
    <Bleed>
      <div className='posts-page'>

        {/* ── LATEST (featured post) ── */}
        <div className='section-header' id='latest'>
          <span className='section-label'>Latest</span>
          <span className='section-meta'>FEATURED{featuredDate ? ` · ${featuredDate}` : ''}</span>
        </div>
        <Link href={featured.route ?? '/404'} className='featured-card'>
          <div className='featured-chrome'>
            <span className='chrome-dots'><i /><i /><i /></span>
            <span className='chrome-title'>~/posts/{featuredSlug}.mdx</span>
            <span className='chrome-square' aria-hidden='true' />
          </div>
          <div className='featured-inner'>
            <div className='featured-visual'>
              {featured.frontMatter.thumbnail ? (
                <Image
                  src={featured.frontMatter.thumbnail}
                  alt={featured.title}
                  fill
                  sizes='(max-width: 860px) 100vw, 620px'
                  className='featured-thumb-img'
                />
              ) : (
                <div className='featured-glow' />
              )}
            </div>
            <div className='featured-body'>
              <div className='featured-tags'>
                {featured.frontMatter.tags?.map(tag => (
                  <span key={tag} className='featured-tag'>{tag}</span>
                ))}
              </div>
              <div className='featured-title'>{featured.title}</div>
              <p className='featured-excerpt'>{featured.frontMatter.description}</p>
              <div className='featured-meta'>
                <span>{formatDate(featured.frontMatter.date)}</span>
                <span className='featured-cta'>OPEN NOTE</span>
              </div>
            </div>
          </div>
        </Link>

        {/* ── TOPICS + GRID (client-side filtering) ── */}
        <PostsGrid posts={rest} allTags={allTags} />

      </div>
    </Bleed>
  )
}
