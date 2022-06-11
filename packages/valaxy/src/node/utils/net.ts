import net from 'net'

interface GetPort {
  port: number
  isPortChanged: boolean
}

export async function getPort(port: number): Promise<GetPort> {
  let _p = port
  for (;;) {
    try {
      return {
        port: await tryUsePort(_p),
        isPortChanged: _p !== port,
      }
    }
    catch {
      _p++
    }
  }
}

function tryUsePort(port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer().listen(port)
    server.on('listening', () => {
      server.close()
      resolve(port)
    })
    server.on('error', (err) => {
      if (err.message.includes('EADDRINUSE'))
        reject(err)
    })
  })
}
