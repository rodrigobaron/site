// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'

import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'
import { Bleed } from 'nextra/components'

async function getPosts() {
  const { directories } = normalizePages({
    list: await getPageMap('/posts'),
    route: '/posts'
  })
  return directories
    .filter(post => post.name !== 'index')
    .sort((a, b) => new Date(b.frontMatter.date) - new Date(a.frontMatter.date))
}

async function getTags() {
  const posts = await getPosts()
  const tags = posts.flatMap(post => post.frontMatter.tags)
  return tags
}

function formatDate(dateStr, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return new Date(dateStr).toLocaleDateString('en-US', opts)
}

export const metadata = {
  title: 'Posts'
}

export async function PostsPage(props) {
  const params = await (props?.params ?? {})
  const tags = await getTags()
  const allposts = await getPosts()

  const allTags = Object.create(null)
  for (const tag of tags) {
    allTags[tag] ??= 0
    allTags[tag] += 1
  }

  // ── TAG PAGE ────────────────────────────────────────────
  if (params.tag) {
    const posts = allposts.filter(post =>
      post.frontMatter.tags?.includes(decodeURIComponent(params.tag))
    )
    return (
      <Bleed>
        <h1 className='tag-title'>{`Posts tagged "${decodeURIComponent(params.tag)}"`}</h1>
        <div className='tag-wrap'>
          {Object.entries(allTags).map(([tag, count]: [string, number]) => {
            const isActive = tag === decodeURIComponent(params.tag)
            return (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className={`tag tag-with-href ${isActive ? 'tag-active' : 'tag-not-active'}`}
              >
                {tag} ({count})
              </Link>
            )
          })}
        </div>
        <div className='container'>
          {posts.map(post => (
            <Link key={post.route} href={post.route ?? '/404'} className='post-card'>
              <div className='post-card-meta'>
                <span className='post-card-date'>{formatDate(post.frontMatter.date, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <div className='post-card-tags'>
                  {post.frontMatter.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className='post-card-tag'>{tag}</span>
                  ))}
                </div>
              </div>
              <h2 className='post-card-title'>{post.title}</h2>
              <p className='post-card-desc'>{post.frontMatter.description}</p>
              <span className='post-card-arrow'>→ read more</span>
            </Link>
          ))}
        </div>
      </Bleed>
    )
  }

  // ── HOME PAGE ───────────────────────────────────────────
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

      {/* ── TOPICS ── */}
      <div className='section-header home-section-gap'>
        <span className='section-label'>Topics</span>
      </div>
      <div className='tag-wrap home-tag-wrap'>
        {Object.entries(allTags).map(([tag, count]: [string, number]) => (
          <Link
            key={tag}
            href={`/tags/${tag}`}
            className='tag tag-with-href tag-not-active'
          >
            {tag} ({count})
          </Link>
        ))}
      </div>

      {/* ── ALL POSTS grid ── */}
      <div className='section-header home-section-gap'>
        <span className='section-label'>All Posts</span>
        <span className='section-count'>{rest.length} posts</span>
      </div>
      <div className='posts-grid'>
        {rest.map(post => (
          <Link key={post.route} href={post.route ?? '/404'} className='grid-card'>
            <div className='grid-card-thumb'>
              {post.frontMatter.thumbnail ? (
                <Image
                  src={post.frontMatter.thumbnail}
                  alt={post.title}
                  fill
                  className='grid-thumb-img'
                />
              ) : (
                <div className='grid-card-glow' />
              )}
              <span className='grid-card-label'>{post.frontMatter.tags?.[0]}</span>
            </div>
            <div className='grid-card-tag'>{post.frontMatter.tags?.[0]}</div>
            <div className='grid-card-title'>{post.title}</div>
            <p className='grid-card-excerpt'>{post.frontMatter.description}</p>
            <div className='grid-card-footer'>
              <span className='grid-card-date'>{formatDate(post.frontMatter.date)}</span>
              <span className='grid-card-arrow'>→</span>
            </div>
          </Link>
        ))}
      </div>

    </Bleed>
  )
}
