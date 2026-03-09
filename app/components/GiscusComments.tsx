'use client';

import React from 'react';
import Giscus from "@giscus/react";
import { useTheme } from 'nextra-theme-docs';

const GiscusComments = () => {
    const { resolvedTheme } = useTheme();
    const giscusTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    return (
        <div className='x:mx-auto x:flex x:max-w-(--nextra-content-width)'>
            <div className='giscus-wrap'>
        <div className='giscus'>
        <Giscus
            id="comments"
            repo="rodrigobaron/site"
            repoId="R_kgDOGgO1pA"
            category="Announcements"
            categoryId="DIC_kwDONxvZHM4Cmh3a"
            mapping="pathname"
            term="Welcome to Rodrigo Baron's site!"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="top"
            theme={giscusTheme}
            lang="en"
            loading="lazy"
        />
        </div>
        </div>
        </div>
    );
};

export default GiscusComments;