// @ts-nocheck
'use client'
import { usePathname } from 'next/navigation'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function PostMetaHeader({ posts }) {
  const pathname = usePathname()
  const post = posts.find(p => pathname === p.route || pathname.endsWith(p.name))

  if (!post) return null

  return (
    <div className='post-meta-header'>
      <div className='post-meta-tags'>
        {post.tags?.map(tag => (
          <span key={tag} className='post-meta-tag'>{tag}</span>
        ))}
      </div>
      <div className='post-meta-date'>{formatDate(post.date)}</div>
    </div>
  )
}
