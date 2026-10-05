<script lang="ts" setup>
import pkg from '../../packages/create-valaxy/package.json'
</script>

<template>
  <div class="p-4" text="white sm" bg="dark" rounded-lg>
    <pre class="overflow-auto">
  🌌 Valaxy  <span text-blue>v{{ pkg.version }}</span>

<span text-cyan>?</span> Select a type: <span op="70">› - Use arrow-keys. Return to submit.</span>
<span text-cyan>❯   Blog <span op="70">- For Most Users</span></span> <span text-purple>【Press Enter】</span>
    <span text-green>Theme <span op="70">- For Theme Developers</span></span>
    <span text-yellow>Addon <span op="70">- For Addon Developers</span></span>

<span text-cyan>?</span> Select a theme:
<span text-cyan>❯   Yun <span op="70">- A light &amp; clean theme (default)</span></span> <span text-purple>【Press Enter】</span>
    <span text-green>Press <span op="70">- A document-oriented theme</span></span>
    <span text-yellow>Custom <span op="70">- Enter a custom theme name</span></span>

<span text-cyan>?</span> Project name: <span op="70">› valaxy-blog</span> <span text-purple>【Press Enter】</span>
  📁 <span op="70">/root/repos/valaxy-blog</span>

  <span op="70">Scaffolding project in</span> valaxy-blog <span op="70">...</span>
  <span text-green>Done.</span>

<span text-cyan>?</span> Install and start it now? <span op="70">› (Y/n)</span> <span text-purple>【Press N, Enter】</span>

  start it later by:

  cd valaxy-blog
  pnpm install
  pnpm run dev</pre>
  </div>
</template>
