# create-valaxy

## Usage

```bash
# install
npm i
# or pnpm i

# start
npm run dev
# or pnpm dev
```

See `http://localhost:4859/`, have fun!

## Structure

In most cases, you only need to work in the `pages` folder.

- `pages`: your all pages
  - `posts`: write your posts here, will be counted as posts
- `styles`: override theme styles, `index.scss`/`vars.csss`/`index.css` will be loaded automatically
- `components`: custom your vue components (will be loaded automatically)
- `layouts`: custom layouts (use it by `layout: xxx` in md)
- `locales`: custom i18n
- `.vscode`: recommend some useful plugins & settings, you can preview icon/i18n/class...
