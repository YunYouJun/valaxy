import fs from 'fs-extra'
import pathe from 'pathe'

function assertInside(root: string, file: string) {
  const relative = pathe.relative(root, file)
  if (relative === '..' || relative.startsWith('../') || pathe.isAbsolute(relative))
    throw new Error('Invalid file path: outside the allowed directory')
}

/** Resolve existing files and new paths without following symlinks outside root. */
export async function resolveInsideRoot(root: string, file: string) {
  const resolvedRoot = pathe.resolve(root)
  const resolved = pathe.resolve(resolvedRoot, file)
  assertInside(resolvedRoot, resolved)
  let existing = resolved
  while (!await fs.lstat(existing).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT')
      return undefined
    throw error
  })) {
    const parent = pathe.dirname(existing)
    if (parent === existing)
      throw new Error('Allowed directory does not exist')
    existing = parent
  }
  // A missing pages/posts directory is allowed; validate against the site root.
  assertInside(await fs.realpath(resolvedRoot), await fs.realpath(existing))
  return resolved
}

export async function resolvePageFile(userRoot: string, file: string) {
  const resolved = await resolveInsideRoot(userRoot, file)
  assertInside(pathe.resolve(userRoot, 'pages'), resolved)
  if (!resolved.endsWith('.md'))
    throw new Error('Invalid file path: expected a Markdown file')
  return resolved
}
