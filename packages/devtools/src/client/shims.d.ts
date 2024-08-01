declare interface Window {
  __VUE_DEVTOOLS_ROUTER__: import('vue-router').Router

  $frontmatter: any
  $pageData: any

  $valaxy: {
    postList: import('vue').Ref<
      import('valaxy/types').Post[]
    >
  }
}
