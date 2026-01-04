import DefaultTheme from 'vitepress/theme'
import './hyperos.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    if (typeof window !== 'undefined') {
      let animationFrameId: number | null = null
      let cleanupTimeoutId: number | null = null

      const setWillChange = (enable: boolean) => {
        const content = document.querySelector('.VPContent') as HTMLElement
        if (content) {
          content.style.willChange = enable ? 'transform, opacity' : 'auto'
        }
      }

      const triggerEnterAnimation = () => {
        animationFrameId = requestAnimationFrame(() => {
          animationFrameId = requestAnimationFrame(() => {
            document.body.classList.remove('page-leaving')
            document.body.classList.add('page-entering')
            cleanupTimeoutId = window.setTimeout(() => {
              document.body.classList.remove('page-entering')
              setWillChange(false)
            }, 500)
          })
        })
      }

      router.onBeforeRouteChange = () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
        if (cleanupTimeoutId) {
          clearTimeout(cleanupTimeoutId)
          cleanupTimeoutId = null
        }
        setWillChange(true)
        document.body.classList.remove('page-entering')
        document.body.classList.add('page-leaving')
      }

      router.onAfterRouteChanged = triggerEnterAnimation

      // Fix: GitHub Issue #3226 - 浏览器前进/后退不触发onAfterRouteChanged
      // https://github.com/vuejs/vitepress/issues/3226
      window.addEventListener('popstate', () => {
        setWillChange(true)
        triggerEnterAnimation()
      })
    }
  }
}
