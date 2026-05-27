// @ts-nocheck
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function PostNavigation({ posts }) {
  const pathname = usePathname()
  const index = posts.findIndex(p => pathname === p.route || pathname.endsWith(p.name))

  if (index === -1) return null

  const prev = posts[index + 1] ?? null  // older post
  const next = posts[index - 1] ?? null  // newer post

  if (!prev && !next) return null

  return (
    <div className='post-nav-wrap'>
      <div className='post-nav'>
        {prev ? (
          <Link href={prev.route} className='post-nav-link post-nav-prev'>
            <span className='post-nav-arrow'>◂ Previous</span>
            <span className='post-nav-title'>{prev.title}</span>
          </Link>
        ) : (
          <span className='post-nav-placeholder' />
        )}
        {next ? (
          <Link href={next.route} className='post-nav-link post-nav-next'>
            <span className='post-nav-arrow'>Next ▸</span>
            <span className='post-nav-title'>{next.title}</span>
          </Link>
        ) : (
          <span className='post-nav-link post-nav-next' aria-disabled='true'>
            <span className='post-nav-arrow'>Next ▸</span>
            <span className='post-nav-title'>(end of stream)</span>
          </span>
        )}
      </div>
    </div>
  )
}
