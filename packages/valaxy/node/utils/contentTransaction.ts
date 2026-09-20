import fs from 'fs-extra'
import { dirname, resolve } from 'pathe'

interface Change { path: string, content?: string }
interface Backup { path: string, existed: boolean }

/** Restore an interrupted publication before accepting another generation. */
export async function recoverContentTransaction(directory: string) {
  const journal = resolve(directory, 'journal.json')
  if (!await fs.pathExists(journal))
    return
  const backups: Backup[] = await fs.readJson(journal)
  for (const [index, backup] of backups.entries()) {
    if (backup.existed) {
      fs.ensureDirSync(dirname(backup.path))
      fs.copyFileSync(resolve(directory, `${index}.backup`), backup.path)
    }
    else {
      fs.removeSync(backup.path)
    }
  }
  await fs.remove(directory)
}

/** Stage all bytes first; restore the previous complete output on I/O failure. */
export async function publishContentTransaction(directory: string, changes: Change[]) {
  await fs.ensureDir(directory)
  const backups: Backup[] = []
  for (const [index, change] of changes.entries()) {
    const existed = await fs.pathExists(change.path)
    backups.push({ path: change.path, existed })
    if (existed)
      await fs.copyFile(change.path, resolve(directory, `${index}.backup`))
    if (change.content !== undefined)
      await fs.writeFile(resolve(directory, `${index}.next`), change.content)
    await fs.ensureDir(dirname(change.path))
  }
  await fs.writeJson(resolve(directory, 'journal.tmp'), backups)
  await fs.rename(resolve(directory, 'journal.tmp'), resolve(directory, 'journal.json'))
  try {
    // Do not yield between renames: watcher callbacks observe a complete batch.
    for (const [index, change] of changes.entries()) {
      if (change.content === undefined)
        fs.removeSync(change.path)
      else
        fs.renameSync(resolve(directory, `${index}.next`), change.path)
    }
    fs.removeSync(resolve(directory, 'journal.json'))
  }
  catch (error) {
    await recoverContentTransaction(directory)
    throw error
  }
  await fs.remove(directory)
}
