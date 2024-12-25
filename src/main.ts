import './style.css'
import anime from 'animejs'

const StoppedAnimation: Record<string, boolean> = {}

interface IOptions {
  offset: number
  position: number
  radius?: {
    x: number
    y: number
  }
}

const goAround = (options: IOptions) => {
  const { offset, position, radius = { x: 30, y: 15 } } = options

  const delay = 16
  let lastTime: number
  let lastOffsetTime: number
  let speed = 1
  let offsetSpeed = 1
  let resultOffset = offset
  const getShape = (): HTMLElement => document.querySelectorAll('.shape-container')[position - 1] as HTMLElement
  getShape()
    .setAttribute('data-animation-id', String(position))
  if (Math.round(Math.random())) getShape().classList.add('shape-container_back-rotation')
  const animate = (time: number) => {
    if (StoppedAnimation[getShape().dataset.animationId!]) return

    if (!lastOffsetTime || (time - lastOffsetTime) > 100) {
      resultOffset = Math.sin(offsetSpeed) * offset
      lastOffsetTime = time
      offsetSpeed += 0.1
    }

    if (!lastTime || (time - lastTime) > delay) {
      const x = (Math.PI * 2 + radius.x * Math.sin(speed))
      const y = Math.PI * 2 + radius.y * Math.cos(speed)

      anime({
        targets: `.shape-container:nth-child(${position})`,
        translateX: x - resultOffset, translateY: y,
        scale: 1 + y * 0.003,
        opacity: 1 + y * 0.003,
      })
      speed += radius.x * .0001
      lastTime = time
    }


    requestAnimationFrame(animate)
  }

  return animate
}


document.addEventListener('DOMContentLoaded', () => {
  const nextYear = '2025-01-01T00:00:00'
  var tzoffset = (new Date()).getTimezoneOffset() * 60000
  var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1)
  const untilDate = localISOTime >= nextYear ? new Date().getTime() + 4000 : new Date(nextYear).getTime()
  //@ts-ignore
  new FlipDown(untilDate / 1000).start().ifEnded(() => {
    anime({
      targets: '.timer',
      translateX: '400%',
      duration: 30000,
      complete: () => {
        document.querySelector('.timer')?.remove()
      }
    })
    anime({
      targets: 'h1',
      opacity: 1,
      duration: 4000,
    })
    anime({
      targets: 'main',
      keyframes: [
        { translateX: '70%' },
        { opacity: 1 },
        { translateX: 0, duration: 20000, easing: 'linear' },
      ],
      complete: () => {
      }
    })
    anime({
      targets: 'img.shape',
      opacity: 1,
      delay: anime.stagger(200),
    })
    const animations: Array<(time: number) => void> = []
    const elementsLength = document.querySelector('main')?.children.length || 0
    const halfElementsLength = Math.round(elementsLength / 2)
    let count = 0
    for (let i = elementsLength; i !== 0; i-=1) {
      const x = ((++count - halfElementsLength) * 5) + 200
      const animation = goAround({
        radius: { x, y: x - x / 2 },
        position: i,
        offset: (halfElementsLength + 5 - i) * (halfElementsLength - i)
      })
      animations.unshift(animation)
    }

    const startAnimation = () => {
      animations.forEach(animation => {
        setTimeout(() => {
          requestAnimationFrame(animation)
        }, Math.random() * 1000 + 300)
      })
    }

    startAnimation()

    const stoppedShapeClass = 'shape-container_stopped'
    document.querySelectorAll('.shape').forEach(shape => {
      shape.addEventListener('mouseenter', (event) => {
        const target = event.target  as HTMLElement
        const { audioId} = target.dataset
        const parentNode = target.parentNode as HTMLElement
        const { animationId } = parentNode.dataset
        parentNode.style.zIndex = '100'
        if (!animationId) return

        if (audioId) {
          const audio = document.getElementById(audioId) as HTMLAudioElement
          parentNode.classList.add(stoppedShapeClass)
          audio.play()
        }
        StoppedAnimation[animationId] = true
      })
      shape.addEventListener('mouseleave', (event) => {
        const target = event.target  as HTMLElement
        const { audioId} = target.dataset
        const parentNode = target.parentNode as HTMLElement
        const { animationId } = parentNode.dataset
        if (!animationId) return

        StoppedAnimation[animationId] = false

        setTimeout(() => {
          if (animationId && StoppedAnimation[animationId]) return

          if (audioId) {
            const audio = document.getElementById(audioId) as HTMLAudioElement
            audio.pause()
            parentNode.classList.remove(stoppedShapeClass)
            if (!audio.dataset.shouldContinue) {
              audio.currentTime = 0
            }
          }
          parentNode.style.zIndex = ''
          requestAnimationFrame(animations[Number(animationId) - 1])
        }, 500)
      })
    })
  })
})
