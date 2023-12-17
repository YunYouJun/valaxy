import { createBangumiApi } from 'bangumi-api'
import consola from 'consola'
import pkg from '../package.json'

const bangumiApi = createBangumiApi()
bangumiApi.axios.defaults.headers.common['User-Agent'] = `YunYouJun/girid + (${pkg.repository.url})`

export async function getBangumiDataFromBangumiApi() {
  const data = await bangumiApi.subjects({
    subject_id: 1,
  }).get()
  consola.log(data)
}
