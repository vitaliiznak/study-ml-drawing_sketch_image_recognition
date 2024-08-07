type Point = [number, number]

const drawPath = (
  ctx: CanvasRenderingContext2D,
  path: Point[],
  color = 'black'
) => {
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(...path[0])
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(...path[i])
  }
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()
}

const drawPaths = (
  ctx: CanvasRenderingContext2D,
  paths: Point[][],
  color = 'black'
) => {
  for (const path of paths) {
    drawPath(ctx, path, color)
  }
}

export default class SketchPad {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  isDrawing = false
  paths: Point[][] = []

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.isDrawing = false
    this.ctx = this.canvas.getContext('2d')!
    this.reset()
    this.#addEventListeners()
  }

  reset(): void {
    this.paths = []
    this.isDrawing = false
    this.#redraw()
  }

  #addEventListeners(): void {
    this.canvas.onpointerdown = (evt: PointerEvent) => {
      evt.preventDefault()
      const mouse = this.#getMouse(evt)
      this.paths.push([mouse])
      this.isDrawing = true
    }
    this.canvas.onpointermove = (evt: PointerEvent) => {
      evt.preventDefault()
      if (this.isDrawing) {
        const mouse = this.#getMouse(evt)
        const lastPath = this.paths[this.paths.length - 1]
        lastPath.push(mouse)
        this.#redraw()
      }
    }
    document.onpointerup = (evt: PointerEvent) => {
      evt.preventDefault()
      this.isDrawing = false
    }
  }

  #redraw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    drawPaths(this.ctx, this.paths)
  }

  #getMouse(evt: MouseEvent): Point {
    const rect = this.canvas.getBoundingClientRect()
    return [
      Math.round(evt.clientX - rect.left),
      Math.round(evt.clientY - rect.top)
    ]
  }
}
