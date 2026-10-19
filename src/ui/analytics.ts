import { useEffect, type RefObject } from 'react'

type AnalyticsValue = string | number | boolean | null | undefined
type AnalyticsProps = Record<string, AnalyticsValue>

declare global {
  interface Window {
    zaraz?: {
      track?: (event: string, properties?: Record<string, string | number | boolean | null>) => void
    }
    gtag?: (command: 'event', event: string, properties?: Record<string, string | number | boolean | null>) => void
  }
}

function clean(properties: AnalyticsProps) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean | null>
}

export function track(event: string, properties: AnalyticsProps = {}) {
  if (typeof window === 'undefined') return

  const payload = clean(properties)
  if (window.zaraz?.track) {
    window.zaraz.track(event, payload)
    return
  }

  window.gtag?.('event', event, payload)
}

export function useSectionAnalytics(section: string, ref: RefObject<Element>) {
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        track('section_view', { section })
        io.disconnect()
      },
      { threshold: 0.35, rootMargin: '-12% 0px -12% 0px' },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [ref, section])
}
