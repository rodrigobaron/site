import { PostHero } from '../components/PostHero'
import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'

export default async function PostsLayout({ children }) {
  const { directories } = normalizePages({
    list: await getPageMap('/posts'),
    route: '/posts'
  })

  const posts = directories
    .filter(p => p.name !== 'index')
    .map(p => ({
      name: p.name,
      route: p.route,
      title: p.title,
      date: p.frontMatter?.date ?? null,
      tags: p.frontMatter?.tags ?? [],
      description: p.frontMatter?.description ?? '',
      thumbnail: p.frontMatter?.thumbnail ?? null,
      author: p.frontMatter?.author ?? '',
    }))

  return (
    <>
      <PostHero posts={posts} />
      {children}
    </>
  )
}
