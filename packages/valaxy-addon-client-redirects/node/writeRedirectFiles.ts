import { writeFile } from 'node:fs/promises'
import { ensureFile } from 'fs-extra'

export async function writeRedirectFiles(route: string, filePath: string) {
  await ensureFile(filePath)
  await writeFile(filePath, `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=${route}">
  <link rel="canonical" href="${route}">
</head>
  <script>
    window.location.href = '${route}' + window.location.search + window.location.hash
  </script>
</html>
  `)
}
