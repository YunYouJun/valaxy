<script lang="ts" setup>
import type { WalineInitOptions } from '@waline/client'

// import consola from 'consola'

const customOptions: WalineInitOptions = {
  serverURL: 'https://waline.yunyoujun.cn',
  pageview: true,
  comment: true,

  // imageUploader: (file) => {
  //   consola.info('Upload file: ', file)

  //   const formData = new FormData()
  //   const headers = new Headers()

  //   formData.append('file', file)
  //   headers.append('Authorization', '!{API TOKEN}')
  //   headers.append('Accept', 'application/json')

  //   return fetch('!{API URL}', {
  //     method: 'POST',
  //     headers,
  //     body: formData,
  //   })
  //     .then(resp => resp.json())
  //     .then(resp => resp.data.links.url)
  // },
}
</script>

<template>
  <WalineClient w="full" :options="customOptions" />
</template>
