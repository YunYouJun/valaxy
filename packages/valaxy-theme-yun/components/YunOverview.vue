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

.site-author-status {
  position: absolute;
  height: 1.8rem;
  width: 1.8rem;
  bottom: 0;
  right: 0;
  line-height: 1.8rem;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
  background-color: var(--va-c-bg-light);
  border: 1px solid rgb(255 255 255 / 0.1);
}

.site-name {
  color: var(--va-c-text);
  font-family: get-css-var('font-serif');
  font-weight: 900;
}

.site-description {
  color: var(--va-c-text);
  font-size: 0.8rem;
}
</style>
