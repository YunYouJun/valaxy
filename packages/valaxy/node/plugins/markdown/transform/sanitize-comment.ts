/**
 * Workaround for unplugin-vue-markdown#extractScriptSetup incorrectly matching
 * `<script setup>` (and `<style>`) tags that live inside HTML comments.
 *
 * The upstream regex `/<\s*script([^>]*)\bsetup\b([^>]*)>([\s\S]*)<\/script>/g`
 * does not account for HTML comment boundaries, so a markdown snippet like:
 *
 * ```md
 * <!--
 * <script setup lang="ts">
 * import { ref } from "vue";
 * </script>
 * -->
 * ```
 *
 * …will be extracted as a real SFC block, causing the "Single file component
 * can contain only one <script setup> element" error when a real `<script setup>`
 * block is also present.
 *
 * This function escapes `<script` / `<style` / `</script` / `</style` inside
 * HTML comments so that the upstream regex no longer matches them.
 *
 * @see https://github.com/YunYouJun/valaxy/issues/558
 */

const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g

/**
 * Inside an HTML comment, escape angle brackets of `<script` and `<style`
 * (both opening and closing tags) so that SFC extraction regexes skip them.
 */
function escapeSfcTagsInComment(comment: string): string {
  // Match the same forms the upstream regex accepts:
  //   <script, < script, </script, < /script, < / script  (and style)
  // The upstream scriptSetupRE uses `<\s*script` so we must also handle
  // optional whitespace after `<` and after `/`.
  // Word boundary `\b` prevents matching `<scripture>`, `<stylesheet>`, etc.
  return comment
    .replace(/<(\s*(?:script|style)\b)/gi, '&lt;$1')
    .replace(/<(\s*\/\s*(?:script|style)\b)/gi, '&lt;$1')
}

/**
 * Sanitize rendered HTML by escaping SFC-like tags inside HTML comments.
 * This prevents upstream `unplugin-vue-markdown` from incorrectly extracting
 * them as real Vue SFC blocks.
 */
export function sanitizeCommentedSfcBlocks(html: string): string {
  return html.replace(HTML_COMMENT_RE, match => escapeSfcTagsInComment(match))
}
