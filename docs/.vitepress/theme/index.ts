import DefaultTheme from 'vitepress/theme'
import './hyperos.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    if (typeof window !== 'undefined') {
      router.onBeforeRouteChange = () => {
        document.body.classList.add('page-leaving')
      }
      router.onAfterRouteChanged = () => {
        document.body.classList.remove('page-leaving')
        document.body.classList.add('page-entering')
        setTimeout(() => {
          document.body.classList.remove('page-entering')
        }, 600)
      }
    }
  }
}
