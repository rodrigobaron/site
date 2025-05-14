// @ts-nocheck
import Link from 'next/link'
import clsx from 'clsx'
import { ComponentProps, ReactElement, ReactNode } from 'react'

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

type Size = 'lg' | 'md'

const Heading = ({
    className,
    size = 'lg',
    children,
    ...props
  }: {
    size?: Size;
  } & ComponentProps<'h2'>): ReactElement => {
    return (
      <h2
        className={clsx(
          'heading-wrap',
          {
            lg: 'heading-lg',
            md: 'heading-mb',
          }[size],
          className,
        )}
        {...props}
      >
        {children}
      </h2>
    );
  };

  const Description = ({
    className,
    size = 'lg',
    children,
  }: {
    size?: Size
    className?: string
    children: ReactNode
  }): ReactElement => {
    return (
      <p
        className={clsx(
          'description-wrap',
          {
            lg: 'description-lg',
            md: 'description-md',
          }[size],
          className
        )}
      >
        {children}
      </p>
    )
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
    
    // If all import methods fail, you can try replacing Bleed with a div as a temporary solution
    return (
        <Bleed>
            <h1 className='tag-title'>{params.tag && `Posts Tagged with "${decodeURIComponent(params.tag)}"`}</h1>
            <div className='tag-wrap'>
            {Object.entries(allTags).map(([tag, count]: [string, number]) => {
                // Check if this tag matches the current params.tag
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
                <Link
                key={post.route}
                href={post.route ?? '/404'}
                className='container-item'
              >
                <img
                  src={post.frontMatter.thumbnail}
                  alt={post.title}
                  className='container-item-image'
                />
                <div className='heading-block'>
                  <Heading size='md' className='heading'>
                    {post.title}
                  </Heading>
                  <Description
                    size='md'
                    className='description'
                  >
                    {post.frontMatter.description}
                  </Description>
                  <div className='container-footer'>
                    <span className='container-footer-wrap'>
                      <span className='select-none'> • </span>
                      {new Date(post.frontMatter.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            </div>
        </Bleed>
    )
}