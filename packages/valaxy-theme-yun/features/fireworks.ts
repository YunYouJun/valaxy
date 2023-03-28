/**
 * @see https://codepen.io/juliangarnier/pen/gmOwJX
 * inherited from hexo-theme-yun
 * customized by valaxy-theme-yun
 * @author YunYouJun
 */

import anime from 'animejs/lib/anime.es.js'
import { TinyColor } from '@ctrl/tinycolor'

interface MinMax {
  min: number
  max: number
}

interface FireworksConfig {
  selector: string
  colors: string[]
  numberOfParticles: number
  orbitRadius: MinMax
  circleRadius: MinMax
  diffuseRadius: MinMax
  animeDuration: MinMax
}

export interface Point {
  x: number
  y: number
}

export interface Particle extends Point {
  color: string
  radius: number
  endPos: Point
  draw(): void
}

/**
 * 创建烟花
 * @param config
 */
export function createFireworks(config: Partial<FireworksConfig>) {
  const defaultColors = ['#66A7DD', '#3E83E1', '#214EC2']

  const {
    colors = defaultColors,
    selector = 'canvas.fireworks',
    // sky blue
    numberOfParticles = 20,
    circleRadius = {
      min: 10,
      max: 20,
    },
    diffuseRadius = {
      min: 50,
      max: 100,
    },
    orbitRadius = {
      min: 50,
      max: 100,
    },
    animeDuration = {
      min: 900,
      max: 1500,
    },
  } = config

  let pointerX = 0
  let pointerY = 0

  const canvasEl = document.querySelector(selector) as HTMLCanvasElement
  const ctx = canvasEl.getContext('2d')

  if (!ctx)
    return

  /**
   * 设置画布尺寸
   */
  function setCanvasSize(canvasEl: HTMLCanvasElement) {
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    canvasEl.style.width = `${window.innerWidth}px`
    canvasEl.style.height = `${window.innerHeight}px`
  }

  /**
   * update pointer
   * @param e
   */
  function updateCoords(e: MouseEvent | TouchEvent) {
    pointerX
      = 'clientX' in e
        ? e.clientX
        : (e.touches[0] ? e.touches[0].clientX : e.changedTouches[0].clientX)
    pointerY
      = 'clientY' in e
        ? e.clientY
        : (e.touches[0] ? e.touches[0].clientY : e.changedTouches[0].clientY)
  }

  function setParticleDirection(p: Point) {
    const angle = (anime.random(0, 360) * Math.PI) / 180
    const value = anime.random(
      diffuseRadius.min,
      diffuseRadius.max,
    )
    const radius = [-1, 1][anime.random(0, 1)] * value
    return {
      x: p.x + radius * Math.cos(angle),
      y: p.y + radius * Math.sin(angle),
    }
  }

  /**
   * 在指定位置创建粒子
   * @param {number} x
   * @param {number} y
   * @returns
   */
  function createParticle(x: number, y: number) {
    const tinyColor = new TinyColor(colors[anime.random(0, colors.length - 1)])
    tinyColor.setAlpha(anime.random(0.2, 0.8))

    const p: Particle = {
      x,
      y,
      color: tinyColor.toRgbString(),
      radius: anime.random(circleRadius.min, circleRadius.max),
      endPos: setParticleDirection({ x, y }),
      draw: () => {},
    }

    p.draw = function () {
      if (!ctx)
        return

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    return p
  }

  function createCircle(x: number, y: number) {
    const p = {
      x,
      y,
      color: '#000',
      radius: 0.1,
      alpha: 0.5,
      lineWidth: 6,
      draw() {},
    }

    p.draw = () => {
      if (!ctx)
        return

      ctx.globalAlpha = p.alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true)
      ctx.lineWidth = p.lineWidth
      ctx.strokeStyle = p.color
      ctx.stroke()
      ctx.globalAlpha = 1
    }
    return p
  }

  function renderParticle(anim: anime.AnimeInstance) {
    for (let i = 0; i < anim.animatables.length; i++) {
      const target = anim.animatables[i].target as any as Particle
      target.draw()
    }
  }

  function animateParticles(x: number, y: number) {
    const circle = createCircle(x, y)
    const particles = []
    for (let i = 0; i < numberOfParticles; i++)
      particles.push(createParticle(x, y))

    anime
      .timeline()
      .add({
        targets: particles,
        x(p: Particle) {
          return p.endPos.x
        },
        y(p: Particle) {
          return p.endPos.y
        },
        radius: 0.1,
        duration: anime.random(
          animeDuration.min,
          animeDuration.max,
        ),
        easing: 'easeOutExpo',
        update: renderParticle,
      })
      .add(
        {
          targets: circle,
          radius: anime.random(orbitRadius.min, orbitRadius.max),
          lineWidth: 0,
          alpha: {
            value: 0,
            easing: 'linear',
            duration: anime.random(600, 800),
          },
          duration: anime.random(1200, 1800),
          easing: 'easeOutExpo',
          update: renderParticle,
        },
        0,
      )
  }

  const render = anime({
    duration: Infinity,
    update: () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
    },
  })

  document.addEventListener(
    'mousedown',
    (e) => {
      render.play()
      updateCoords(e)
      animateParticles(pointerX, pointerY)
    },
    false,
  )

  setCanvasSize(canvasEl)
  window.addEventListener(
    'resize',
    () => {
      setCanvasSize(canvasEl)
    },
    false,
  )
}
