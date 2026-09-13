<script setup lang="ts">
import type { ReleaseCopy } from '../../data/release-v1'
import { computed, ref } from 'vue'

const props = defineProps<{ copy: ReleaseCopy['writing'], prefix: string }>()
const mode = ref(0)
const count = ref(0)
const source = computed(() => mode.value === 0
  ? `---\ntitle: ${props.copy.hello}\n---\n\n# ${props.copy.hello}\n\n${props.copy.story}\n\n**Markdown** + Vue = Valaxy`
  : `<script setup>\nimport { ref } from 'vue'\nconst count = ref(0)\n<\/script>\n\n# ${props.copy.hello}\n\n<button @click="count++">\n  {{ count }}\n</button>`)
</script>

<template>
  <section id="examples" class="release-width writing-section release-reveal" aria-labelledby="writing-title">
    <div class="writing-intro">
      <h2 id="writing-title" class="release-heading">
        <span v-for="line in copy.title" :key="line">{{ line }}</span>
      </h2>
      <p class="release-description">
        {{ copy.description }}
      </p>
      <RouterLink class="release-text-link" :to="`${prefix}/guide/markdown`">
        {{ copy.link }} ›
      </RouterLink>
    </div>
    <div class="writing-demo">
      <div class="demo-toolbar">
        <div class="release-switch" :aria-label="copy.preview" role="group">
          <button v-for="(label, index) in copy.modes" :key="label" :aria-pressed="mode === index" @click="mode = index">
            {{ label }}
          </button>
        </div>
        <span>hello.md</span>
      </div>
      <div class="demo-panes">
        <div class="source-pane">
          <span class="pane-label">{{ copy.source }}</span><pre><code>{{ source }}</code></pre>
        </div>
        <div class="preview-pane">
          <span class="pane-label">{{ copy.preview }}</span><h3>{{ copy.hello }}</h3><p>{{ copy.story }}</p>
          <p v-if="mode === 0" class="markdown-result">
            <strong>Markdown</strong> + Vue = Valaxy
          </p>
          <div v-else class="counter-demo">
            <button class="release-button" @click="count++">
              {{ copy.count }} <span aria-live="polite">{{ count }}</span>
            </button>
            <button class="counter-reset" @click="count = 0">
              {{ copy.reset }}
            </button>
            <p>{{ copy.hint }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.writing-section {
  padding-block: 120px 80px;
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 60px;
  align-items: center;
}

.writing-intro .release-text-link {
  display: inline-block;
  margin-top: 28px;
}

.writing-demo {
  min-width: 0;
  background: var(--release-surface);
  border: 1px solid var(--release-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 40px #1d1d1f04;
}

.demo-toolbar {
  padding: 14px 18px;
  border-bottom: 1px solid var(--release-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--release-muted);
}

.demo-panes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 335px;
}

.source-pane {
  border-right: 1px solid var(--release-border);
  min-width: 0;
  padding: 22px 18px;
  background: var(--release-inset);
}

.source-pane pre {
  margin-top: 22px;
  font-size: 11px;
  line-height: 1.95;
  color: var(--release-code);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.pane-label {
  color: var(--release-muted);
  font-size: 10px;
}

.preview-pane {
  padding: 22px;
}

.preview-pane h3 {
  font-weight: 650;
  font-size: 25px;
  margin: 36px 0 14px;
  letter-spacing: -0.7px;
}

.preview-pane p {
  font-size: 12px;
  color: var(--release-muted);
  line-height: 1.9;
}

.markdown-result {
  margin-top: 24px;
}

.counter-demo {
  margin-top: 24px;
}

.counter-demo .release-button {
  padding: 10px 14px;
  font-size: 12px;
  gap: 8px;
}

.counter-reset {
  margin: 12px;
  color: var(--release-link);
  font-size: 11px;
}

.counter-demo p {
  margin-top: 15px;
}

@media (width <= 1000px) {
  .writing-section {
    gap: 32px;
    grid-template-columns: 1fr;
  }

  .writing-intro {
    max-width: 620px;
  }

  .demo-panes {
    min-height: 300px;
  }
}

@media (width <= 500px) {
  .writing-section {
    padding-top: 80px;
  }

  .demo-toolbar {
    padding: 12px;
  }

  .demo-panes {
    grid-template-columns: 1fr;
  }

  .source-pane {
    border-right: 0;
    border-bottom: 1px solid var(--release-border);
  }

  .source-pane pre {
    margin-top: 12px;
  }

  .preview-pane {
    min-height: 230px;
  }

  .preview-pane h3 {
    margin-top: 18px;
  }
}
</style>
