import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function usePagination(options: {
  /**
   * Post 总数
   */
  total: number
  /**
   * 每页数量
   */
  pageSize: number
}) {
  const route = useRoute()
  const curPage = computed<number>(() => Number.parseInt((route.params as { page: string }).page || '1'))

  const totalPages = computed(() => Math.ceil(options.total / options.pageSize))

  /**
   * 围绕的长度
   */
  const surLen = computed(() => {
    if (curPage.value === 1 || curPage.value === totalPages.value)
      return 3
    else
      return 2
  })

  function showPage(i: number) {
    if (i === 1)
      return true
    else if (i === totalPages.value)
      return true
    return i > curPage.value - surLen.value && i < curPage.value + surLen.value
  }

  function getTo(i: number) {
    if (i === 1)
      return '/'
    else return `/page/${i}`
  }

  const prevTo = computed(() => {
    return getTo(curPage.value - 1)
  })
  const nextTo = computed(() => {
    return getTo(curPage.value + 1)
  })

  const showPrev = computed(() => curPage.value > 1)
  const showNext = computed(() => curPage.value < totalPages.value)

  return {
    curPage,
    totalPages,
    showPage,
    surLen,

    getTo,
    prevTo,
    nextTo,
    showPrev,
    showNext,
  }
}
