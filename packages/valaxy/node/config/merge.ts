import { createDefu } from 'defu'

// function replaceByClonedSource(options: any) {
//   const clone = options.clone
//   return function (target: object, source: object) {
//     return clone(source)
//   }
// }

/**
 * replace array instead of concat
 */
export const replaceArrMerge = createDefu((obj, key, value) => {
  if (key && obj[key] && Array.isArray(obj[key]) && Array.isArray(value)) {
    obj[key] = value
    return true
  }
})
