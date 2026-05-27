import { cache } from 'react'
import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'

export const POSTS_ROUTE = '/posts'

export const getPosts = cache(async () => {
  const { directories } = normalizePages({
    list: await getPageMap(POSTS_ROUTE),
    route: POSTS_ROUTE,
  })
  return directories.filter(p => p.name !== 'index')
})

export const getPostsByDateDesc = cache(async () => {
  const posts = await getPosts()
  return [...posts].sort(
    (a, b) => new Date(b.frontMatter?.date).getTime() - new Date(a.frontMatter?.date).getTime()
  )
})
