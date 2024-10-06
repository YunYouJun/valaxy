<script lang="ts" setup>
// overview
</script>

<template>
  <div class="sidebar-panel" p="2">
    <YunSiteInfo />

    <YunSidebarNav />
    <hr m="t-4 b-2" op="20">
    <YunSocialLinks />
    <hr m="y-2" op="20">
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
</style>
