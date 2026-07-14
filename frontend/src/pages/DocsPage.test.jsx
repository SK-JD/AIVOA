import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import DocsPage from './DocsPage'

// Guards against JSX render crashes (e.g. stray {braces} interpreted as expressions).
describe('DocsPage', () => {
  it('renders without throwing and includes all sections', () => {
    const html = renderToStaticMarkup(<DocsPage />)
    expect(html).toContain('Documentation')
    expect(html).toContain('LangGraph Workflow')
    expect(html).toContain('Voice Processing')
    expect(html).toContain('[{type, name}]') // the previously-broken JSON shape renders literally
  })
})
