import GiscusComments from "../../components/GiscusComments";
import { PostMetaHeader } from "../../components/PostMetaHeader";
import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'

export default async function CommentsLayout({ children }) {
  const { directories } = normalizePages({
    list: await getPageMap('/posts'),
    route: '/posts'
  })

  const posts = directories
    .filter(p => p.name !== 'index')
    .map(p => ({
      name: p.name,
      route: p.route,
      date: p.frontMatter?.date ?? null,
      tags: p.frontMatter?.tags ?? [],
    }))

  return (
    <>
      <PostMetaHeader posts={posts} />
      {children}
      <GiscusComments />
    </>
  )
}
