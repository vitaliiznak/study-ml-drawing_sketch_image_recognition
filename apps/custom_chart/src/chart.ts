import graphics from "./graphics";
import mathUtils from "./mathUtils";


type OptionsT = {
  size?: number;
  axesLabels?: string[];
  styles?: {
    [key: string]: {
      color: string;
      size: number;
    }
  }
}

type SamplesT = any[]





export default class Chart {
  canvas: HTMLCanvasElement
  samples: SamplesT
  options: OptionsT
  ctx: CanvasRenderingContext2D
  transparency: number
  margin: number
  pixelBounds: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  }

  dataBounds: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  }

  constructor(canvas: HTMLCanvasElement, samples: SamplesT, options: OptionsT = {}) {
    this.canvas = canvas
    this.samples = samples
    this.options = options
    this.ctx = this.canvas.getContext('2d')!
    this.transparency = 0.8
    this.margin = this.canvas.width * 0.1
    this.pixelBounds = this.#getPixelBounds()
    this.dataBounds = this.#getDataBounds()
    this.#draw()
    /*  this.init() */
  }


  #getPixelBounds() {
    const { canvas, margin } = this
    return {
      xMin: margin,
      xMax: canvas.width - margin,
      yMin: margin,
      yMax: canvas.height - margin
    }
  }

  #getDataBounds() {
    const { samples } = this
    const x = samples.map(s => s.point[0])
    const y = samples.map(s => s.point[1])
    const xMin = Math.min(...x)
    const xMax = Math.max(...x)
    const yMin = Math.min(...y)
    const yMax = Math.max(...y)

    return { xMin, xMax, yMin, yMax }
  }

  #draw() {
    const { ctx, canvas } = this
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = this.transparency
    this.#drawSamples()
    ctx.globalAlpha = 1
  }

  #drawSamples() {
    const { ctx, samples, pixelBounds, dataBounds, options } = this
    samples.forEach((sample) => {
      const pixelLoc = mathUtils.remapPoint(dataBounds, pixelBounds, sample.point)
      graphics.drawPoint(ctx, pixelLoc, 2)
    })
  }



}