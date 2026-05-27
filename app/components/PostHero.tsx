// @ts-nocheck
'use client'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { formatDate } from '../lib/format'

function deriveCornerLabel(post): string {
  const tag = post.tags?.[0]
  if (!tag) return 'note · diagram'
  return `${String(tag).toLowerCase()} · diagram`
}

export function PostHero({ posts }) {
  const pathname = usePathname()
  const post = posts.find(p => pathname === p.route || pathname.endsWith(p.name))

  if (!post) return null

  return (
    <header className='post-hero'>
      <h1 className='post-hero-title'>{post.title}</h1>
      {post.thumbnail && (
        <div className='post-hero-cover'>
          <span className='post-hero-cover-corner'>
            <span className='dot' />
            {deriveCornerLabel(post)}
          </span>
          <span className='post-hero-cover-corner-r'>FIG.01</span>
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className='post-hero-cover-img'
            sizes='(max-width: 768px) 100vw, 980px'
            priority
          />
        </div>
      )}
      {post.description && (
        <p className='post-hero-description'>{post.description}</p>
      )}
      <div className='post-hero-meta'>
        <div className='post-hero-meta-inner'>
          {post.author && (
            <div className='post-hero-meta-item'>
              <span className='post-hero-meta-label'>Author</span>
              <span className='post-hero-author'>{post.author}</span>
            </div>
          )}
          {post.tags?.length > 0 && (
            <div className='post-hero-meta-item'>
              <span className='post-hero-meta-label'>Topics</span>
              <div className='post-hero-tags'>
                {post.tags.map(tag => (
                  <span key={tag} className='post-hero-tag'>{tag}</span>
                ))}
              </div>
            </div>
          )}
          {post.date && (
            <div className='post-hero-meta-item'>
              <span className='post-hero-meta-label'>Published</span>
              <span className='post-hero-date'>{formatDate(post.date, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          )}
          {post.readingMinutes && (
            <div className='post-hero-meta-item'>
              <span className='post-hero-meta-label'>Read</span>
              <span className='post-hero-date'>~{post.readingMinutes} min</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
