// Types for virtual modules
// `#valaxy/*` is an alias for `/@valaxyjs/*`, because TS will consider `/@valaxyjs/*` as an absolute path that we can't override

declare module 'virtual:valaxy-theme' {
  export default any
}

declare module '#valaxy/styles' {
  // side-effects only
  export default string
}

// valaxy features
declare module '#valaxy/blog/collections' {

  const collections: Collection[]
  export default collections
}
