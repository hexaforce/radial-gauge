export default class RadialGauge {
  constructor(canvas, options) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d', { antialias: true })
    this.radius = this.canvas.width / 2
    this.options = options

    const dpr = window.devicePixelRatio || 1
    const logicalWidth = this.radius * 2
    const logicalHeight = this.radius * 2
    this.canvas.width = logicalWidth * dpr
    this.canvas.height = logicalHeight * dpr
    this.canvas.style.width = `${logicalWidth}px`
    this.canvas.style.height = `${logicalHeight}px`
    this.ctx.scale(dpr, dpr)
    this.center = {
      x: logicalWidth / 2,
      y: logicalHeight / 2,
    }

    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'

    this.drawBar(this.options.value)
    this.drawScale()
    this.drawNeedle(this.options.value)
  }

  drawBar(value) {
    const { startAngle, endAngle } = this.options

    this.barWidth = this.radius / 4
    this.ctx.lineWidth = this.barWidth

    this.ctx.beginPath()
    this.ctx.arc(this.center.x, this.center.y, this.radius / 1.15, this.degToRad(startAngle), this.degToRad(endAngle))
    this.ctx.strokeStyle = this.options.empty
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.arc(this.center.x, this.center.y, this.radius / 1.15, this.degToRad(startAngle), this.degToRad(startAngle))
    this.ctx.strokeStyle = this.options.full
    this.ctx.stroke()

    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillStyle = this.options.text

    this.ctx.font = `${this.radius / 13}px Arial`
    this.ctx.fillText(this.options.title, this.center.x, this.center.y - this.radius * 0.225)

    this.ctx.font = `${this.radius / 15}px Arial`
    this.ctx.fillText(this.options.units, this.center.x, this.center.y - this.radius * 0.125)

    this.ctx.font = `${this.radius / 5}px Arial`
    this.ctx.fillText(value.toFixed(2), this.center.x, this.center.y + this.radius * 0.25)
  }

  drawScale() {
    const { startAngle, endAngle, min, max, ticks } = this.options
    const angleRange = 360 - Math.abs(startAngle - endAngle)
    const angleStep = angleRange / (ticks * 10)
    const startTick = startAngle + 90

    this.ctx.font = `${this.radius / 10}px Arial` //'14px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'bottom'

    this.tickLength = this.radius / 15
    this.ctx.strokeStyle = this.options.text

    for (let n = 0; n <= ticks * 10; n++) {
      const angle = n * angleStep + startTick
      const isMajorTick = n % 10 === 0
      const tickLength = isMajorTick ? this.tickLength : this.tickLength * 0.5

      this.ctx.save()
      this.ctx.translate(this.center.x, this.center.y)
      this.ctx.rotate(this.degToRad(angle))

      this.ctx.beginPath()
      this.ctx.moveTo(0, -this.radius / 1.375)
      this.ctx.lineTo(0, -this.radius / 1.375 + tickLength)
      this.ctx.lineWidth = ((isMajorTick ? 1.7 : 1.1) * this.radius) / 150
      this.ctx.stroke()

      if (isMajorTick) {
        const value = min + (n / (ticks * 10)) * (max - min)
        this.ctx.fillText(value.toFixed(0), 0, -this.radius / 1.85)
      }

      this.ctx.restore()
    }
  }

  drawNeedle(value) {
    const { min, max, startAngle, endAngle } = this.options
    const angleRange = 360 - Math.abs(startAngle - endAngle)
    const percentage = (value - min) / (max - min)
    const angle = startAngle + angleRange * percentage

    const endX = this.center.x + (this.radius / 1.6 + this.barWidth / 2) * Math.cos(this.degToRad(angle))
    const endY = this.center.y + (this.radius / 1.6 + this.barWidth / 2) * Math.sin(this.degToRad(angle))

    this.ctx.beginPath()
    this.ctx.arc(this.center.x, this.center.y, this.radius / 30, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.beginPath()
    this.ctx.moveTo(this.center.x, this.center.y)
    this.ctx.lineTo(endX, endY)
    this.ctx.lineWidth = (1.2 * this.radius) / 150
    this.ctx.stroke()
  }

  degToRad(degrees) {
    return (degrees * Math.PI) / 180
  }

  setValueAnimated(value, duration = 0.5) {
    const start = this.options.value
    const { min, max } = this.options
    const end = Math.min(Math.max(Number(value), min), max)
    const change = end - start
    const iterations = 60 * duration
    let currentIteration = 1

    const easing = (pos) => {
      if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 3)
      return 0.5 * (Math.pow(pos - 2, 3) + 2)
    }

    const animate = () => {
      const progress = currentIteration / iterations
      const val = change * easing(progress) + start
      this.update(val)
      currentIteration += 1
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        this.options.value = end
      }
    }

    requestAnimationFrame(animate)
  }

  update(value) {
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight)

    this.drawBar(value)
    this.drawScale()
    this.drawNeedle(value)

    const { startAngle, endAngle, min, max } = this.options
    const angleRange = 360 - Math.abs(startAngle - endAngle)
    const percentage = (value - min) / (max - min)
    const currentAngle = startAngle + angleRange * percentage

    this.ctx.beginPath()
    this.ctx.arc(this.center.x, this.center.y, this.radius / 1.15, this.degToRad(startAngle), this.degToRad(currentAngle))
    this.ctx.lineWidth = this.barWidth
    this.ctx.strokeStyle = this.options.full
    this.ctx.stroke()
  }
}
