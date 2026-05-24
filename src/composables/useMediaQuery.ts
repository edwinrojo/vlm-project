import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/** Reactive match for a CSS media query (SSR-safe default: false). */
export function useMediaQuery(query: string): Ref<boolean> {
  const matches = ref(false)

  let media: MediaQueryList | undefined

  function update() {
    matches.value = media?.matches ?? false
  }

  onMounted(() => {
    media = window.matchMedia(query)
    update()
    media.addEventListener('change', update)
  })

  onUnmounted(() => {
    media?.removeEventListener('change', update)
  })

  return matches
}
