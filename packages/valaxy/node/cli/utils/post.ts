// import { readFile, writeFile } from 'fs/promises'

export interface CreatePostParams {
  date?: boolean
  path: string
  layout?: string
  title: string
}

// const pagesPath = 'pages/'

export const create = async (_: CreatePostParams) => {

}
