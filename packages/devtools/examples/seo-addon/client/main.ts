import { connectValaxyDevtools, onValaxyPageChanged } from '@valaxyjs/devtools/client-api'
import './style.css'

const status = document.querySelector<HTMLParagraphElement>('#status')!
const posts = document.querySelector<HTMLUListElement>('#posts')!
const currentPage = document.querySelector<HTMLParagraphElement>('#page')!

async function start() {
  const { client, data } = await connectValaxyDevtools({ webmcp: false })
  let closed = false
  let revision = 0
  async function refresh() {
    const version = ++revision
    try {
      const result = await data.getPostList()
      if (closed || version !== revision)
        return
      posts.replaceChildren(...result.posts.map((post) => {
        const item = document.createElement('li')
        const title = document.createElement('strong')
        title.textContent = typeof post.frontmatter.title === 'string' ? post.frontmatter.title : post.routePath
        const description = document.createElement('span')
        const value = post.frontmatter.seoDescription
        description.textContent = typeof value === 'string' && value ? value : 'Missing description'
        description.className = value ? 'ready' : 'missing'
        item.append(title, description)
        return item
      }))
      status.textContent = `${result.posts.length} posts · shared Valaxy data`
    }
    catch (error) {
      if (!closed)
        status.textContent = String(error)
    }
  }
  const stop = await data.onChanged(refresh)
  const stopPage = onValaxyPageChanged(page => currentPage.textContent = page ? `Inspecting ${page.routePath}` : 'Open from the site Dock to inspect the current page.')
  const stopStatus = client.events.on('connection:status', (value) => {
    if (value === 'connected')
      void refresh()
    else status.textContent = `Connection: ${value}`
  })
  await refresh()
  window.addEventListener('pagehide', () => {
    closed = true
    stop()
    stopPage()
    stopStatus()
    client.close?.()
  }, { once: true })
}

start().catch(error => status.textContent = String(error))
