import net from 'net'

interface GetPort {
  port: number
  isPortChanged: boolean
}

export async function findFreePort(startPort: number): Promise<GetPort> {
  let _p = startPort
  while (!await isPortFree(_p))
    _p++
  return { port: _p, isPortChanged: _p !== startPort }
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
