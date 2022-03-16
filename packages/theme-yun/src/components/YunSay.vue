<template>
  <div class="say">
    <span v-if="sayContent" class="say-content">{{ sayContent }}</span>
    <span v-if="sayAuthor" class="say-author"> {{ sayAuthor }}</span>
    <span v-if="sayFrom" class="say-from">{{ sayFrom }}</span>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useConfig } from 'valaxy'

const { themeConfig } = useConfig()

const sayContent = ref('')
const sayAuthor = ref('')
const sayFrom = ref('')

/**
 * 获取在线 API 语录
 */
function fetchApiToSay() {
  const api = themeConfig.say.hitokoto.enable ? themeConfig.say.hitokoto.api : themeConfig.say.api
  if (!api) return

  fetch(api)
    .then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          if (themeConfig.say.hitokoto.enable) {
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
          `${themeConfig.say.api}, HTTP error, status = ${res.status}`,
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

<style lang="scss">
.say {
  color: var(--yun-c-text);
  display: block;
  text-align: center;
  font-family: var(--yun-font-family-serif);
  font-weight: bold;
  padding: 0.5rem;
  border-top: var(--yun-border-width) solid var(--yun-c-text-light);
  border-bottom: var(--yun-border-width) solid var(--yun-c-text-light);

  .say-content {
    display: block;
  }

  .say-from {
    display: block;
  }
}
</style>
