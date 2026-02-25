// @ts-nocheck
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

function formatDate(dateStr, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return new Date(dateStr).toLocaleDateString('en-US', opts)
}

export function PostsGrid({ posts, allTags }) {
  const [activeTopic, setActiveTopic] = useState('all')

  const filtered = activeTopic === 'all'
    ? posts
    : posts.filter(post => post.frontMatter?.tags?.includes(activeTopic))

  return (
    <>
      {/* ── TOPICS ── */}
      <div className='section-header home-section-gap'>
        <span className='section-label'>Topics</span>
      </div>
      <div className='tag-wrap home-tag-wrap'>
        <button
          onClick={() => setActiveTopic('all')}
          className={`tag ${activeTopic === 'all' ? 'tag-active' : 'tag-with-href tag-not-active'}`}
        >
          All ({posts.length})
        </button>
        {Object.entries(allTags).map(([tag, count]: [string, number]) => (
          <button
            key={tag}
            onClick={() => setActiveTopic(tag)}
            className={`tag ${activeTopic === tag ? 'tag-active' : 'tag-with-href tag-not-active'}`}
          >
            {tag} ({count})
          </button>
        ))}
      </div>

      {/* ── ALL POSTS grid ── */}
      <div className='posts-grid home-section-gap'>
        {filtered.map(post => (
          <Link key={post.route} href={post.route ?? '/404'} className='grid-card'>
            <div className='grid-card-thumb'>
              {post.frontMatter?.thumbnail ? (
                <Image
                  src={post.frontMatter.thumbnail}
                  alt={post.title}
                  fill
                  className='grid-thumb-img'
                />
              ) : (
                <div className='grid-card-glow' />
              )}
            </div>
            <div className='grid-card-tags'>
              {post.frontMatter?.tags?.map(tag => (
                <span key={tag} className='grid-card-tag'>{tag}</span>
              ))}
            </div>
            <div className='grid-card-title'>{post.title}</div>
            <p className='grid-card-excerpt'>{post.frontMatter?.description}</p>
            <div className='grid-card-footer'>
              <span className='grid-card-date'>{formatDate(post.frontMatter?.date)}</span>
              <span className='grid-card-arrow'>→</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
