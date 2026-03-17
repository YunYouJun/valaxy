import { describe, expect, it } from 'vitest'
import { sanitizeCommentedSfcBlocks } from '../packages/valaxy/node/plugins/markdown/transform/sanitize-comment'

describe('sanitizeCommentedSfcBlocks (issue #558)', () => {
  it('should escape <script setup> inside HTML comments', () => {
    const html = `<p>Some text</p>
<!--
<script setup lang="ts">
import { ref } from "vue";
</script>
-->
<p>More text</p>`

    const result = sanitizeCommentedSfcBlocks(html)
    // The <script> tags inside comments should be escaped
    expect(result).toContain('&lt;script setup lang="ts">')
    expect(result).toContain('&lt;/script>')
    // The comment wrapper itself is preserved
    expect(result).toContain('<!--')
    // Content outside comments should be untouched
    expect(result).toContain('<p>Some text</p>')
    expect(result).toContain('<p>More text</p>')
  })

  it('should escape <style> inside HTML comments', () => {
    const html = `<!--
<style scoped>
.foo { color: red; }
</style>
-->`

    const result = sanitizeCommentedSfcBlocks(html)
    expect(result).toContain('&lt;style scoped>')
    expect(result).toContain('&lt;/style>')
  })

  it('should not affect <script setup> outside HTML comments', () => {
    const html = `<script setup lang="ts">
import { ref } from "vue";
</script>
<p>Content</p>`

    const result = sanitizeCommentedSfcBlocks(html)
    expect(result).toBe(html)
  })

  it('should handle multiple comments', () => {
    const html = `<!-- <script setup>code1</script> -->
<p>text</p>
<!-- <style>code2</style> -->`

    const result = sanitizeCommentedSfcBlocks(html)
    expect(result).not.toMatch(/<script/)
    expect(result).not.toMatch(/<style/)
    expect(result).not.toMatch(/<\/script/)
    expect(result).not.toMatch(/<\/style/)
    expect(result).toContain('<p>text</p>')
  })

  it('should handle comments without SFC tags', () => {
    const html = `<!-- This is a normal comment -->
<p>Content</p>`

    const result = sanitizeCommentedSfcBlocks(html)
    expect(result).toBe(html)
  })

  it('should not be matched by unplugin-vue-markdown scriptSetupRE after sanitization', () => {
    const html = `<p>Some text</p>
<!--
<script setup lang="ts">
import { ref } from "vue";
</script>
-->
<p>More text</p>`

    const sanitized = sanitizeCommentedSfcBlocks(html)

    // This is the exact regex from unplugin-vue-markdown
    const scriptSetupRE = /<\s*script([^>]*)\bsetup\b([^>]*)>([\s\S]*)<\/script>/g
    const matches = [...sanitized.matchAll(scriptSetupRE)]
    expect(matches).toHaveLength(0)
  })

  it('should preserve real script setup while sanitizing commented ones', () => {
    const html = `<script setup lang="ts">
const count = ref(0);
</script>
<p>Some text</p>
<!--
<script setup lang="ts">
import { ref } from "vue";
</script>
-->
<p>More text</p>`

    const sanitized = sanitizeCommentedSfcBlocks(html)

    // The regex should only match the real (non-commented) script setup
    const scriptSetupRE = /<\s*script([^>]*)\bsetup\b([^>]*)>([\s\S]*)<\/script>/g
    const matches = [...sanitized.matchAll(scriptSetupRE)]
    expect(matches).toHaveLength(1)
    expect(matches[0][0]).toContain('const count = ref(0)')
  })

  it('should handle whitespace-tolerant forms like "< script setup>"', () => {
    // The upstream regex uses `<\s*script`, so `< script` also matches
    const html = `<!-- < script setup lang="ts">code</ script> -->`
    const sanitized = sanitizeCommentedSfcBlocks(html)

    const scriptSetupRE = /<\s*script([^>]*)\bsetup\b([^>]*)>([\s\S]*)<\/script>/g
    expect([...sanitized.matchAll(scriptSetupRE)]).toHaveLength(0)
  })

  it('should not escape tag names that merely start with script/style', () => {
    // <scripture> and <stylesheet> are not SFC tags
    const html = `<!-- <scripture>text</scripture> <stylesheet>css</stylesheet> -->`
    const result = sanitizeCommentedSfcBlocks(html)
    // These should NOT be escaped because they are not real script/style tags
    expect(result).toContain('<scripture>')
    expect(result).toContain('<stylesheet>')
  })
})
