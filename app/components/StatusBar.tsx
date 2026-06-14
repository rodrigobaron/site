'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const YEAR = new Date().getFullYear()

function formatPath(pathname: string): string {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '')
  return trimmed || 'home'
}

export function StatusBar() {
  const pathname = usePathname() || '/'
  const [progress, setProgress] = useState<number>(0)
  const lastPct = useRef<number>(-1)
  const isPost = pathname.startsWith('/posts/') && pathname !== '/posts'

  useEffect(() => {
    if (!isPost) return
    const update = () => {
      const doc = document.documentElement
      const max = (doc.scrollHeight || 0) - (doc.clientHeight || window.innerHeight || 0)
      const pct = max > 0 ? Math.round(Math.max(0, Math.min(1, (window.scrollY || 0) / max)) * 100) : 0
      if (pct === lastPct.current) return
      lastPct.current = pct
      setProgress(pct)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pathname])

  return (
    <>
      <div className='sb-cell'>
        <span className='sb-key'>file</span>
        <span className='sb-val'>{formatPath(pathname)}</span>
      </div>
      <div className='sb-cell hide-sm'>
        <span className='sb-key'>build</span>
        <span className='sb-val'>v0.4.0</span>
      </div>
      <div className='sb-cell hide-sm'>
        <span className='sb-key'>load</span>
        <span className='sb-warn'>0.42 / 0.51 / 0.38</span>
      </div>
      {isPost && (
        <div className='sb-cell hide-sm'>
          <span className='sb-key'>read</span>
          <div className='sb-progress'>
            <div className='sb-progress-fill' style={{ width: `${progress}%` }} />
          </div>
          <span className='sb-val'>{progress}%</span>
        </div>
      )}
      <div className='sb-cell'>
        <span className='sb-key'>©</span>
        <span className='sb-val'>baron · {YEAR}</span>
      </div>
    </>
  )
}
