'use client';

import React from 'react';
import Giscus from "@giscus/react";

const GiscusComments = () => {
    return (
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
                    theme="dark"
                    lang="en"
                    loading="lazy"
                />
            </div>
        </div>
    );
};

export default GiscusComments;
