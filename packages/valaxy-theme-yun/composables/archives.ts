import type { Ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface ArchiveYearSummary {
  year: number
  count: number
}

/**
 * Manage active archive year tracking, hash restoration, and smooth jump navigation
 * across both mobile year pills and the desktop archive rail.
 */
export function useArchiveYearNav(
  years: Ref<ArchiveYearSummary[]>,
  enabled: Ref<boolean>,
) {
  const route = useRoute()
  const router = useRouter()
  const activeYear = ref<number | null>(years.value[0]?.year ?? null)

  let frame = 0
  let lockedYear: number | null = null
  let lockTimer: ReturnType<typeof setTimeout> | undefined
  let pinnedYear: number | null = null
  let pinnedScrollY = 0

  function clearClickState() {
    lockedYear = null
    pinnedYear = null
    if (lockTimer !== undefined) {
      clearTimeout(lockTimer)
      lockTimer = undefined
    }
  }

  function settleScrollLock() {
    if (lockTimer !== undefined) {
      clearTimeout(lockTimer)
      lockTimer = undefined
    }
    if (lockedYear !== null) {
      pinnedYear = lockedYear
      pinnedScrollY = window.scrollY
      lockedYear = null
      activeYear.value = pinnedYear
    }
  }

  function resolveHashYear(hash: string): number | null {
    const match = /^#archive-year-(\d+)$/.exec(hash)
    if (!match)
      return null
    const year = Number(match[1])
    return years.value.some(item => item.year === year) ? year : null
  }

  function updateActiveYear() {
    if (!enabled.value || !years.value.length || typeof document === 'undefined') {
      activeYear.value = years.value[0]?.year ?? null
      return
    }

    if (lockedYear !== null) {
      activeYear.value = lockedYear
      return
    }

    if (pinnedYear !== null) {
      if (Math.abs(window.scrollY - pinnedScrollY) < 40) {
        activeYear.value = pinnedYear
        return
      }
      pinnedYear = null
    }

    const scrollBottom = window.scrollY + window.innerHeight
    const docHeight = document.documentElement.scrollHeight
    if (docHeight > window.innerHeight && scrollBottom >= docHeight - 4) {
      activeYear.value = years.value.at(-1)?.year ?? null
      return
    }

    const threshold = 136
    let current = years.value[0].year
    for (const item of years.value) {
      const el = document.getElementById(`archive-year-${item.year}`)
      if (!el)
        continue
      if (el.getBoundingClientRect().top <= threshold)
        current = item.year
      else
        break
    }

    activeYear.value = current
  }

  function scheduleUpdate() {
    if (!enabled.value || typeof window === 'undefined')
      return
    if (lockedYear !== null) {
      if (lockTimer !== undefined)
        clearTimeout(lockTimer)
      lockTimer = setTimeout(settleScrollLock, 150)
      return
    }
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(updateActiveYear)
  }

  function scrollToYear(year: number) {
    if (typeof document === 'undefined')
      return
    const el = document.getElementById(`archive-year-${year}`)
    if (!el)
      return

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    clearClickState()
    activeYear.value = year

    if (!reducedMotion) {
      lockedYear = year
      lockTimer = setTimeout(settleScrollLock, 700)
    }

    el.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
    if (!el.hasAttribute('tabindex'))
      el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
    if (reducedMotion) {
      pinnedYear = year
      pinnedScrollY = window.scrollY
    }

    const hash = `#archive-year-${year}`
    if (route.hash !== hash) {
      void router.replace({
        path: route.path,
        query: route.query,
        hash,
      }).catch(() => {})
    }
  }

  watch(years, async () => {
    clearClickState()
    if (!years.value.some(item => item.year === activeYear.value))
      activeYear.value = years.value[0]?.year ?? null
    await nextTick()
    updateActiveYear()
  }, { flush: 'post' })

  onMounted(() => {
    const hashYear = resolveHashYear(route.hash || window.location.hash)
    if (hashYear !== null && enabled.value) {
      activeYear.value = hashYear
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      lockedYear = hashYear
      lockTimer = setTimeout(settleScrollLock, reducedMotion ? 100 : 700)
      return
    }
    updateActiveYear()
  })

  onUnmounted(() => {
    cancelAnimationFrame(frame)
    clearClickState()
  })

  useEventListener('scroll', scheduleUpdate, { passive: true })
  useEventListener('resize', scheduleUpdate, { passive: true })
  useEventListener('wheel', () => {
    clearClickState()
    scheduleUpdate()
  }, { passive: true })
  useEventListener('touchmove', () => {
    clearClickState()
    scheduleUpdate()
  }, { passive: true })
  useEventListener('scrollend', () => {
    if (lockedYear !== null)
      settleScrollLock()
  }, { passive: true })

  return {
    activeYear,
    scrollToYear,
  }
}
