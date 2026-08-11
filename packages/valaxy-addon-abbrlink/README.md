# valaxy-addon-abbrlink

**English** | [简体中文](https://valaxy.site/zh/addons/official/abbrlink)

Generate stable abbreviated links for Valaxy posts using CRC-based hashes.

## Installation

```bash
pnpm add valaxy-addon-abbrlink
```

## Usage

Load the addon in `valaxy.config.ts`:

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonAbbrlink } from 'valaxy-addon-abbrlink'

export default defineValaxyConfig({
  addons: [
    addonAbbrlink(),
  ],
})
```
