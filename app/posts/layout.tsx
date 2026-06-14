import { PostHero } from '../components/PostHero'
import { getPosts } from '../lib/posts'
import { readingMinutes } from '../lib/readingTime'

export default async function PostsLayout({ children }) {
  const directories = await getPosts()

  const posts = await Promise.all(
    directories.map(async p => ({
      name: p.name,
      route: p.route,
      title: p.title,
      date: p.frontMatter?.date ?? null,
      tags: p.frontMatter?.tags ?? [],
      description: p.frontMatter?.description ?? '',
      thumbnail: p.frontMatter?.thumbnail ?? null,
      author: p.frontMatter?.author ?? '',
      readingMinutes: await readingMinutes(p.name),
    }))
  )

  return (
    <>
      <PostHero posts={posts} />
      {children}
    </>
  )
}
