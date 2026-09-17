import { fileURLToPath } from 'node:url'
import { defineValaxyDevtoolsPlugin } from '@valaxyjs/devtools/plugin'

export default defineValaxyDevtoolsPlugin({
  apiVersion: 1,
  id: 'seo-example',
  name: 'SEO',
  panels: [{
    id: 'overview',
    title: 'SEO Overview',
    icon: 'ph:magnifying-glass',
    clientAssets: fileURLToPath(new URL('./dist/client', import.meta.url)),
  }],
  editor: {
    fields: [
      { key: 'seoDescription', type: 'textarea', label: 'SEO description', description: 'An example addon field; your theme decides how to render it.', maxLength: 160 },
      { key: 'seoNoindex', type: 'boolean', label: 'Exclude from indexing' },
      { key: 'seoPriority', type: 'number', label: 'SEO priority', min: 0, max: 1, step: 0.1 },
      { key: 'seoReview', type: 'select', label: 'Review status', options: [{ label: 'Pending', value: 'pending' }, { label: 'Reviewed', value: 'reviewed' }] },
    ],
    actions: [{
      id: 'check-description',
      label: 'Check SEO description',
      run: ({ draft }) => typeof draft.seoDescription === 'string' && draft.seoDescription.trim().length >= 30
        ? { severity: 'success', message: 'Description is ready for review.' }
        : { severity: 'warn', message: 'Consider a description of at least 30 characters.' },
    }],
  },
})
