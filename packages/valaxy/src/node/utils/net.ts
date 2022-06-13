import net from 'net'

export async function findFreePort(start: number): Promise<number> {
  if (await isPortFree(start))
    return start
  return await findFreePort(start + 1)
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
      .listen(port, () => {
        server.close()
        resolve(true)
      })
      .on('error', () => {
        resolve(false)
      })
  })
}
