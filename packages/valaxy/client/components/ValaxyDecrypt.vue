<script lang="ts" setup>
import { useDecrypt, useFrontmatter } from 'valaxy'
import { defineComponent, h, ref } from 'vue'

const props = defineProps<{
  encryptedContent: string
}>()

const password = ref('')
const decryptedContent = ref('')

const hasError = ref(true)

const { decrypt } = useDecrypt()
async function decryptContent() {
  const ciphertext = props.encryptedContent
  if (!ciphertext)
    return
  try {
    const result = await decrypt(password.value, ciphertext)
    decryptedContent.value = result || ''
  }
  catch {
    hasError.value = true
  }
}

function encryptAgain() {
  decryptedContent.value = ''
  password.value = ''
}

const ValaxyDeprecatedContent = defineComponent({
  name: 'ValaxyDeprecatedContent',
  props: {
    html: String,
  },
  render() {
    const content = `<div>${this.html}</div>`
    return h({
      setup: () => {
        const fm = useFrontmatter()
        return {
          frontmatter: fm,
        }
      },
      template: content,
    })
  },
})
</script>

<template>
  <div v-if="!decryptedContent" w-full pt-14 pb-10>
    <div
      class="decrypt-password-container w-full sm:w-1/2 md:w-1/3"
      flex-center m-auto relative
    >
      <input
        v-model="password"
        w-full
        border px-5 py-3 rounded hover:shadow transition
        type="password" placeholder="Enter password"
        :class="hasError && 'border-red'"
        @input="hasError = false"
        @keyup.enter="decryptContent"
      >
      <div
        cursor-pointer
        absolute text-2xl
        i-ri-arrow-right-circle-line right-3
        text-gray hover:text-black
        @click="decryptContent"
      />
    </div>
  </div>
  <div v-else>
    <ValaxyDeprecatedContent :html="decryptedContent" />
    <div w-full text-center mt-8>
      <button m-auto class="btn" font-bold @click="encryptAgain">
        Encrypt Again
      </button>
    </div>
  </div>
</template>
