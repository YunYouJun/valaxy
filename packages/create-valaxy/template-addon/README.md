# valaxy-addon-template

## Usage

```bash
npm i valaxy-addon-template
```

### 加载插件

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonTemplate } from 'valaxy-addon-template'

export default defineValaxyConfig({
  addons: [
    addonTemplate(),
  ],
})
```
