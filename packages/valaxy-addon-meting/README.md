# valaxy-addon-meting

Global music player based on [APlayer](https://github.com/DIYgod/APlayer) and [MetingJS](https://github.com/metowolf/MetingJS).

- [ ] Release
- [ ] Components `MetingJS`
- [ ] `addonMeting`

```ts
import { defineConfig } from 'valaxy'
import { addonMeting } from 'valaxy-addon-meting'

export default defineConfig({
  addons: [
    addonMeting({
      global: true,
      props: {
        /** @see https://github.com/metowolf/MetingJS */
      }
    })
  ]
})
```

## props

You can [meting#options](https://github.com/metowolf/MetingJS#option)

## FAQ

- `import 'meting/dist/Meting.min.js'` is not working, only cdn work
