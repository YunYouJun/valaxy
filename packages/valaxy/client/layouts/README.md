## Layouts

Vue components in this dir are used as layouts.

By default, `default.vue` will be used unless an alternative is specified in the route meta.

With [vue-router](https://router.vuejs.org/) file-based routing and [`vite-plugin-vue-layouts-next`](https://github.com/loicduong/vite-plugin-vue-layouts-next), you can specify the layout in the page's SFCs like this:

```html
<route lang="yaml">
meta:
  layout: home
</route>
```
