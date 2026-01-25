/**
 * Remove git+ prefix from repository URL
 * @param url - Repository URL that may contain git+ prefix
 * @returns Normalized URL without git+ prefix
 * @example
 * normalizeRepositoryUrl('git+https://github.com/user/repo.git')
 * // => 'https://github.com/user/repo.git'
 */
export function normalizeRepositoryUrl(url: string): string {
  return url.replace(/^git\+/, '')
}
