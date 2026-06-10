# rodrigobaron.com

- [x] **Nextra 4**
- [x] **Search with Pagefind**
- [x] **Lucide Icons**
- [x] **Giscus Comments**

[![](.github/screenshot.png)](https://nextra-docs-starter.vercel.app)

## Quick Start

You can deploy this template on Vercel by clicking the button below

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fphucbm%2Fnextra-docs-starter)

## Local Development

### Clone this repository

Using the GitHub CLI:
```bash
gh repo clone rodrigobaron/site
```

### Install
```bash
pnpm i
```

### Run the development server
```bash
pnpm dev
```

## Authoring Posts

### Cover image (`thumbnail` frontmatter)

The post hero renders the cover at **16:9** at all viewport sizes. To avoid letterbox bars on either side:

- 1x: **1100 × 619**
- 2x (retina, recommended): **2200 × 1238**

Any 16:9 source (e.g. 1920 × 1080) works edge-to-edge. Non-16:9 images will be `contain`-fit against a white background.

## License

This project is licensed under the MIT License.
