declare module 'escape-html' {
  function escape(str: string): string
  export default escape
}

declare module 'markdown-it-table-of-contents' {
  const def: any
  export default def
}

declare module 'markdown-it-task-lists' {
  const def: any
  export default def
}

declare module 'markdown-it-image-figures' {
  const def: any
  export default def
}

declare module 'diacritics' {
  function remove(str: string): string
  export { remove }
}

declare module 'markdown-it/lib/token.mjs' {
  interface Token {
    src?: [string, string]
  }
}
