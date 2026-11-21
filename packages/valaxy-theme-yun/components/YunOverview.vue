<script lang="ts" setup>
// overview
</script>

<template>
  <div class="sidebar-panel" p="2">
    <YunSiteInfo />

    <YunSidebarNav />
    <hr class="yun-overview-divider" m="t-4 b-2">
    <YunSocialLinks />
    <hr class="yun-overview-divider" m="y-2">
    <YunSidebarLinks />
    <br>
  </div>

  <YunConfig />
</template>

<style lang="scss">
@use "valaxy/client/styles/mixins/index.scss" as *;

.site-name {
  color: var(--va-c-text);
  font-family: get-css-var('font-serif');
  font-weight: 900;
}

.yun-overview-divider {
  border: 0;
  border-top: 1px solid var(--yun-surface-line);
}
</style>
