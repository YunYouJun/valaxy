<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useThemeConfig } from '../composables'

const themeConfig = useThemeConfig()

const sayContent = ref('')
const sayAuthor = ref('')
const sayFrom = ref('')

/**
 * 获取在线 API 语录
 */
function fetchApiToSay() {
  const api = themeConfig.value.say.hitokoto.enable ? themeConfig.value.say.hitokoto.api : themeConfig.value.say.api
  if (!api)
    return

  fetch(api)
    .then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          if (themeConfig.value.say.hitokoto.enable) {
            sayContent.value = data.hitokoto
            sayAuthor.value = data.from_who
            sayFrom.value = data.from
          }
          else {
            const sentence = data[Math.floor(Math.random() * data.length)]
            if (sentence.content) {
              sayContent.value = sentence.content
              sayAuthor.value = sentence.author
              sayFrom.value = sentence.from
            }
            else {
              sayContent.value = sentence
            }
          }
        })
      }
      else {
        throw new Error(
          `${themeConfig.value.say.api}, HTTP error, status = ${res.status}`,
        )
      }
    })
    .catch((err) => {
      console.error(err.message)
    })
}

onMounted(() => {
  fetchApiToSay()
})
</script>

<template>
  <div class="say">
    <span v-if="sayContent" class="say-content animate-fade-in animate-iteration-1">{{ sayContent }}</span>
    <span v-if="sayAuthor" class="say-author"> {{ sayAuthor }}</span>
    <span v-if="sayFrom" class="say-from">{{ sayFrom }}</span>
  </div>
</template>

<style lang="scss">
.say {
  color: var(--va-c-text);
  display: block;
  text-align: center;
  font-family: var(--va-font-serif);
  font-weight: bold;
  padding: 0.5rem;
  // border-top: var(--va-border-width) solid var(--va-c-text-light);
  border-bottom: var(--va-border-width) solid var(--va-c-text-light);

  .say-content {
    display: block;
  }

  .say-from {
    display: block;
  }
}
</style>
