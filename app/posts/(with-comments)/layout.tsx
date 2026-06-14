import GiscusComments from "../../components/GiscusComments";
import { PostNavigation } from "../../components/PostNavigation";
import { getPostsByDateDesc } from "../../lib/posts";

export default async function CommentsLayout({ children }) {
  const directories = await getPostsByDateDesc()
  const posts = directories.map(p => ({
    name: p.name,
    route: p.route,
    title: p.title,
    date: p.frontMatter?.date ?? null,
    tags: p.frontMatter?.tags ?? [],
  }))

  return (
    <>
      {children}
      <PostNavigation posts={posts} />
      <GiscusComments />
    </>
  )
}
