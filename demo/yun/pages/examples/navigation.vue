<template>
  <main class="navigation-preview-page">
    <header>
      <h1>首页导航设计对比</h1>
      <p>同一组入口，四种呈现。试试明暗模式和你喜欢的图标配色。</p>
    </header>
    <YunNavigationPlayground />
  </main>
</template>

<route lang="json">
{
  "meta": {
    "layout": false,
    "frontmatter": {
      "title": "首页导航设计对比",
      "sidebar": false,
      "aside": false
    }
  }
}
</route>

<style scoped>
.navigation-preview-page {
  width: min(860px, calc(100% - 32px));
  margin: 96px auto 48px;
}

header { margin-bottom: 24px; }

h1 {
  font-size: 26px;
  font-weight: 600;
}

p {
  margin-top: 8px;
  color: var(--va-c-text-2);
}
</style>
