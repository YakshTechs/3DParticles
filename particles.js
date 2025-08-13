// Compiled JavaScript version for immediate use
class ParticleSystem {
  constructor(canvasId) {
    this.particles = []
    this.mousePosition = { x: 0, y: 0 }
    this.isTouching = false
    this.isMobile = false
    this.textImageData = null
    this.animationFrameId = 0

    this.animate = (scale) => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.fillStyle = "black"
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      const { x: mouseX, y: mouseY } = this.mousePosition
      const maxDistance = 240

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i]
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance && (this.isTouching || !("ontouchstart" in window))) {
          const force = (maxDistance - distance) / maxDistance
          const angle = Math.atan2(dy, dx)
          const moveX = Math.cos(angle) * force * 60
          const moveY = Math.sin(angle) * force * 60
          p.x = p.baseX - moveX
          p.y = p.baseY - moveY

          this.ctx.fillStyle = p.scatteredColor
        } else {
          p.x += (p.baseX - p.x) * 0.1
          p.y += (p.baseY - p.y) * 0.1
          this.ctx.fillStyle = "white"
        }

        this.ctx.fillRect(p.x, p.y, p.size, p.size)

        p.life--
        if (p.life <= 0) {
          const newParticle = this.createParticle(scale)
          if (newParticle) {
            this.particles[i] = newParticle
          } else {
            this.particles.splice(i, 1)
            i--
          }
        }
      }

      const baseParticleCount = 7000
      const targetParticleCount = Math.floor(
        baseParticleCount * Math.sqrt((this.canvas.width * this.canvas.height) / (1920 * 1080)),
      )

      while (this.particles.length < targetParticleCount) {
        const newParticle = this.createParticle(scale)
        if (newParticle) this.particles.push(newParticle)
      }

      this.animationFrameId = requestAnimationFrame(() => this.animate(scale))
    }

    this.handleResize = () => {
      this.updateCanvasSize()
      const newScale = this.createTextImage()
      this.particles = []
      this.createInitialParticles(newScale)
    }

    this.handleMove = (x, y) => {
      this.mousePosition = { x, y }
    }

    this.handleMouseMove = (e) => {
      this.handleMove(e.clientX, e.clientY)
    }

    this.handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault()
        this.handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    this.handleTouchStart = () => {
      this.isTouching = true
    }

    this.handleTouchEnd = () => {
      this.isTouching = false
      this.mousePosition = { x: 0, y: 0 }
    }

    this.handleMouseLeave = () => {
      if (!("ontouchstart" in window)) {
        this.mousePosition = { x: 0, y: 0 }
      }
    }

    this.canvas = document.getElementById(canvasId)
    if (!this.canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`)
    }

    const ctx = this.canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not get 2D context from canvas")
    }
    this.ctx = ctx

    this.init()
  }

  init() {
    this.updateCanvasSize()
    this.setupEventListeners()

    const scale = this.createTextImage()
    this.createInitialParticles(scale)
    this.animate(scale)
  }

  updateCanvasSize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.isMobile = window.innerWidth < 768
  }

  createTextImage() {
    this.ctx.fillStyle = "white"
    this.ctx.save()

    const fontSize = this.isMobile ? 48 : 96
    this.ctx.font = `bold ${fontSize}px Arial, sans-serif`
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    const yakshWidth = this.ctx.measureText("YAKSH").width
    const devaniWidth = this.ctx.measureText("DEVANI").width
    const totalSpacing = this.isMobile ? 120 : 200

    const yakshX = centerX - totalSpacing / 2 - yakshWidth / 2
    const devaniX = centerX + totalSpacing / 2 + devaniWidth / 2

    this.ctx.fillText("YAKSH", yakshX, centerY)
    this.ctx.fillText("DEVANI", devaniX, centerY)

    this.ctx.restore()

    this.textImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    return fontSize / 96
  }

  createParticle(scale) {
    if (!this.textImageData) return null

    const data = this.textImageData.data

    for (let attempt = 0; attempt < 100; attempt++) {
      const x = Math.floor(Math.random() * this.canvas.width)
      const y = Math.floor(Math.random() * this.canvas.height)

      if (data[(y * this.canvas.width + x) * 4 + 3] > 128) {
        const centerX = this.canvas.width / 2
        const isDevani = x > centerX

        return {
          x: x,
          y: y,
          baseX: x,
          baseY: y,
          size: Math.random() * 1 + 0.5,
          color: "white",
          scatteredColor: isDevani ? "#FF9900" : "#00DCFF",
          isDevani: isDevani,
          life: Math.random() * 100 + 50,
        }
      }
    }

    return null
  }

  createInitialParticles(scale) {
    const baseParticleCount = 7000
    const particleCount = Math.floor(
      baseParticleCount * Math.sqrt((this.canvas.width * this.canvas.height) / (1920 * 1080)),
    )

    for (let i = 0; i < particleCount; i++) {
      const particle = this.createParticle(scale)
      if (particle) this.particles.push(particle)
    }
  }

  setupEventListeners() {
    window.addEventListener("resize", this.handleResize)
    this.canvas.addEventListener("mousemove", this.handleMouseMove)
    this.canvas.addEventListener("touchmove", this.handleTouchMove, { passive: false })
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave)
    this.canvas.addEventListener("touchstart", this.handleTouchStart)
    this.canvas.addEventListener("touchend", this.handleTouchEnd)
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize)
    this.canvas.removeEventListener("mousemove", this.handleMouseMove)
    this.canvas.removeEventListener("touchmove", this.handleTouchMove)
    this.canvas.removeEventListener("mouseleave", this.handleMouseLeave)
    this.canvas.removeEventListener("touchstart", this.handleTouchStart)
    this.canvas.removeEventListener("touchend", this.handleTouchEnd)
    cancelAnimationFrame(this.animationFrameId)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ParticleSystem("particleCanvas")
})
