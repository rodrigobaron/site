// @ts-nocheck
import Link from 'next/link'

import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'
import { Bleed } from 'nextra/components'

async function getPosts() {
  const { directories } = normalizePages({
    list: await getPageMap('/posts'),
    route: '/posts'
  })
  return directories
    .filter(post => post.name !== 'index')
    .sort((a, b) => new Date(b.frontMatter.date) - new Date(a.frontMatter.date))
}

async function getTags() {
  const posts = await getPosts()
  const tags = posts.flatMap(post => post.frontMatter.tags)
  return tags
}

export const metadata = {
    title: 'Posts'
}

export async function PostsPage(props) {
    const params = await (props?.params ?? {});
    const tags = await getTags()
    const allposts = await getPosts()

    const posts = params.tag
    ? allposts.filter(post =>
        post.frontMatter.tags?.includes(decodeURIComponent(params.tag))
      )
    : allposts;

    const allTags = Object.create(null)

    for (const tag of tags) {
        allTags[tag] ??= 0
        allTags[tag] += 1
    }

    return (
        <Bleed>
            <h1 className='tag-title'>{params.tag && `Posts Tagged with "${decodeURIComponent(params.tag)}"`}</h1>
            <div className='tag-wrap'>
            {Object.entries(allTags).map(([tag, count]: [string, number]) => {
                const isActive = params.tag && tag === decodeURIComponent(params.tag);

                return (
                    <Link
                        key={tag}
                        href={`/tags/${tag}`}
                        className={`tag tag-with-href ${isActive ? 'tag-active' : 'tag-not-active'}`}
                    >
                        {tag} ({count})
                    </Link>
                );
            })}
            </div>
            <div className='container'>
            {posts.map(post => (
                <Link key={post.route} href={post.route ?? '/404'} className='post-card'>
                  <div className='post-card-meta'>
                    <span className='post-card-date'>
                      {new Date(post.frontMatter.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <div className='post-card-tags'>
                      {post.frontMatter.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className='post-card-tag'>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <h2 className='post-card-title'>{post.title}</h2>
                  <p className='post-card-desc'>{post.frontMatter.description}</p>
                  <span className='post-card-arrow'>→ read more</span>
                </Link>
            ))}
            </div>
        </Bleed>
    )
}
