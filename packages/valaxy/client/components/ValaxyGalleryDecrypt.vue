<script lang="ts" setup>
import { useDecrypt } from 'valaxy'
import { computed, ref } from 'vue'

const props = defineProps<{
  encryptedPhotos: string
}>()

const password = ref('')
const decryptedContent = ref('')

const hasError = ref(false)

const { decrypt } = useDecrypt()
async function decryptContent() {
  const ciphertext = props.encryptedPhotos
  if (!ciphertext)
    return
  try {
    const result = await decrypt(password.value, ciphertext)
    decryptedContent.value = result || ''
  }
  catch (e) {
    hasError.value = true
    console.error(e)
  }
}

function encryptAgain() {
  decryptedContent.value = ''
  password.value = ''
}

const photos = computed(() => JSON.parse(decryptedContent.value || '[]') || [])

defineExpose({
  photos,
})
</script>

<template>
  <div>
    <div v-if="!decryptedContent" w-full pt-14 pb-10>
      <div
        class="decrypt-password-container w-full sm:w-1/2"
        flex-center m-auto relative
      >
        <input
          v-model="password"
          w-full
          border pl-5 pr-11 py-3 rounded hover:shadow transition
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
      <YunGallery :photos="photos" />
      <div w-full text-center mt-8>
        <button m-auto class="btn" font-bold @click="encryptAgain">
          Encrypt Again
        </button>
      </div>
    </div>
  </div>
</template>
