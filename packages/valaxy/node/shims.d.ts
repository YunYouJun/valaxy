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

declare module 'picomatch' {
  interface Options {
    dot?: boolean
    windows?: boolean
  }
  type Matcher = (input: string) => boolean
  function picomatch(glob: string | readonly string[], options?: Options): Matcher
  export default picomatch
}
