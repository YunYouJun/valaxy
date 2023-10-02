import { useRouter } from 'vue-router'

/**
 * back to previous page or home page
 */
export function useBack() {
  const router = useRouter()

  function back() {
    if (document.referrer && document.referrer !== location.href)
      router.back()
    else
      router.push('/')
  }
  return {
    back,
  }
}
