import { title } from "process";

export default {
    '*': {
        type: 'page',
        theme: {
            layout: 'default',
            sidebar: false,
            toc: true,
            typesetting: 'article',
            breadcrumb: false,
            timestamp: false,
        }
    },
    index: {
        title: 'Home',
        theme: {
            layout: 'default',
            sidebar: false,
            pagination: false,
            toc: false
        }
    },
    posts: {
        title: 'Posts',
        display: 'hidden',
        type: 'page',
    },
}