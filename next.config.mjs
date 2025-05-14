import nextra from "nextra";

const withNextra = nextra({
    search: true,
    defaultShowCopyCode: true,
    search: { codeblocks: false },
});

export default withNextra({
});
