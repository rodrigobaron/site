// @ts-nocheck
'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '../lib/format'

export function PostsGrid({ posts, allTags }) {
  const [activeTopic, setActiveTopic] = useState('all')
  const listRef = useRef(null)

  // reveal entries as they scroll into view
  useEffect(() => {
    const root = listRef.current
    if (!root) return
    const rows = Array.from(root.querySelectorAll('.entry-row'))
    if (typeof IntersectionObserver === 'undefined') {
      rows.forEach(r => r.classList.add('in-view'))
      return
    }
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in-view')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    )
    rows.forEach(r => io.observe(r))
    return () => io.disconnect()
  }, [activeTopic])

  const filtered = activeTopic === 'all'
    ? posts
    : posts.filter(post => post.frontMatter?.tags?.includes(activeTopic))

  return (
    <>
      {/* ── TOPICS ── */}
      <div className='section-header home-section-gap'>
        <span className='section-label'>Topics</span>
        <span className='section-meta'>{filtered.length} {filtered.length === 1 ? 'ENTRY' : 'ENTRIES'}</span>
      </div>
      <div className='tag-wrap home-tag-wrap'>
        <span className='filter-prompt'>$ filter --topic</span>
        <button
          onClick={() => setActiveTopic('all')}
          className={`tag ${activeTopic === 'all' ? 'tag-active' : ''}`}
        >
          all <span className='tag-count'>{posts.length}</span>
        </button>
        {Object.entries(allTags).map(([tag, count]: [string, number]) => (
          <button
            key={tag}
            onClick={() => setActiveTopic(tag)}
            className={`tag ${activeTopic === tag ? 'tag-active' : ''}`}
          >
            {tag} <span className='tag-count'>{count}</span>
          </button>
        ))}
      </div>

      {/* ── ALL POSTS — log-style entry list ── */}
      <div className='posts-list home-section-gap' key={activeTopic} ref={listRef}>
        {filtered.map((post, i) => {
          return (
            <Link
              key={post.route}
              href={post.route ?? '/404'}
              className='entry-row'
              style={{ '--d': `${(i % 8) * 50}ms` }}
            >
              <div className='entry-thumb'>
                {post.frontMatter?.thumbnail ? (
                  <Image
                    src={post.frontMatter.thumbnail}
                    alt={post.title}
                    fill
                    sizes='360px'
                    className='grid-thumb-img'
                  />
                ) : (
                  <div className='entry-glow' />
                )}
              </div>
              <div className='entry-main'>
                <div className='entry-meta'>
                  <span className='entry-date'>{formatDate(post.frontMatter?.date)}</span>
                </div>
                <div className='entry-tags'>
                  {post.frontMatter?.tags?.map(tag => (
                    <span key={tag} className='entry-tag'>{tag}</span>
                  ))}
                </div>
                <div className='entry-title'>{post.title}</div>
                <p className='entry-excerpt'>{post.frontMatter?.description}</p>
              </div>
              <span className='entry-arrow'>►</span>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <div className='grid-empty'>
            <span className='prompt-sign'>$</span> grep: no entries match this topic — try another filter
          </div>
        )}
      </div>
    </>
  )
}
