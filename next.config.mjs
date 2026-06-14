import nextra from "nextra";

// Wrap each fenced code block in an MDX JSX <div data-language="X"> so the language
// survives outside Nextra's <Pre> component (which strips data-language props).
function remarkWrapCodeWithLang() {
    return (tree) => {
        function walk(node) {
            if (!node || !Array.isArray(node.children)) return;
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                if (child && child.type === 'code' && child.lang) {
                    const lang = String(child.lang).toLowerCase();
                    node.children[i] = {
                        type: 'mdxJsxFlowElement',
                        name: 'div',
                        attributes: [
                            { type: 'mdxJsxAttribute', name: 'className', value: 'code-lang-wrap' },
                            { type: 'mdxJsxAttribute', name: 'data-language', value: lang },
                        ],
                        children: [child],
                    };
                } else {
                    walk(child);
                }
            }
        }
        walk(tree);
    };
}

const withNextra = nextra({
    defaultShowCopyCode: true,
    search: { codeblocks: false },
    mdxOptions: {
        remarkPlugins: [remarkWrapCodeWithLang],
    },
});

export default withNextra({
    images: {
        dangerouslyAllowSVG: true,
    },
});
