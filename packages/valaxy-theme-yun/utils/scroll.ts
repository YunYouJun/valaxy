import { gsap } from 'gsap'
// Use the CJS entry for Node/SSG compatibility; Vite optimizes it in dev.
import ScrollToPlugin from 'gsap/dist/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

export { gsap }
