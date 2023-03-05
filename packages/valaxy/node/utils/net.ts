import net from 'node:net'

export async function findFreePort(start: number): Promise<number> {
  if (await isPortFree(start))
    return start
  return await findFreePort(start + 1)
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer((socket) => {
      socket.write('Echo server\r\n')
      socket.pipe(socket)
    })

    // not 127.0.0.1
    server.listen(port, '0.0.0.0')
    server.on('error', () => {
      resolve(false)
    })
    server.on('listening', () => {
      server.close()
      resolve(true)
    })
  })
}
