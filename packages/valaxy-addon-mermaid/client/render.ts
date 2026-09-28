import type { MermaidConfig } from 'mermaid'

// Mermaid keeps global configuration. Serialize initialize + render so multiple
// diagrams (including a theme change in flight) cannot borrow each other's theme.
let renderQueue: Promise<unknown> = Promise.resolve()

export function renderDiagram(id: string, source: string, dark: boolean, options: MermaidConfig = {}, appearance: 'default' | 'soft' = 'default') {
  const task = renderQueue.then(async () => {
    const { default: mermaid } = await import('mermaid')
    const colors = dark
      ? { surface: '#17212f', node: '#1b3552', text: '#b7d7ff', border: '#5682b5', line: '#93a4b9', cluster: '#172b40' }
      : { surface: '#ffffff', node: '#e9f2ff', text: '#175ca6', border: '#8ab1e0', line: '#788ba2', cluster: '#f4f8ff' }
    const config: MermaidConfig = {
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: 'base',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      themeVariables: {
        darkMode: dark,
        background: colors.surface,
        primaryColor: colors.node,
        primaryTextColor: colors.text,
        primaryBorderColor: colors.border,
        secondaryColor: colors.cluster,
        tertiaryColor: colors.surface,
        lineColor: colors.line,
        textColor: colors.text,
        mainBkg: colors.node,
        nodeBorder: colors.border,
        clusterBkg: colors.cluster,
        clusterBorder: colors.border,
        edgeLabelBackground: colors.surface,
        nodeTextColor: colors.text,
        actorBkg: colors.node,
        actorBorder: colors.border,
        actorTextColor: colors.text,
        actorLineColor: colors.line,
        signalColor: colors.line,
        signalTextColor: colors.text,
        labelBoxBkgColor: colors.node,
        labelBoxBorderColor: colors.border,
        labelTextColor: colors.text,
        loopTextColor: colors.text,
        noteBkgColor: colors.cluster,
        noteBorderColor: colors.border,
        noteTextColor: colors.text,
        activationBkgColor: colors.cluster,
        activationBorderColor: colors.border,
        fontSize: '15px',
      },
      flowchart: { curve: 'basis', padding: 18, nodeSpacing: 36, rankSpacing: 48 },
      themeCSS: `
        .node rect, .node .label-container { rx: 10px; ry: 10px; }
        .node polygon { stroke-dasharray: 4 3; }
        .nodeLabel, .edgeLabel { font-weight: 500; }
        .edgeLabel rect { rx: 6px; ry: 6px; }
        .edgeLabel p { border-radius: 6px; padding: 2px 5px; }
        .flowchart-link { stroke-width: 1.4px; }
      `,
    }
    const base: MermaidConfig = appearance === 'soft' && !options.theme
      ? config
      : { startOnLoad: false, suppressErrorRendering: true, theme: dark ? 'dark' : 'default' }
    mermaid.initialize({ ...base, ...options, startOnLoad: false, suppressErrorRendering: true })
    return mermaid.render(id, source)
  })
  // A malformed diagram must not prevent the rest of the page from rendering.
  renderQueue = task.catch(() => undefined)
  return task
}
