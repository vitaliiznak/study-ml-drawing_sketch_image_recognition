import graphics, { ColorT } from './graphics'
import mathUtils from './mathUtils'


export type OptionsT = {
  axesLabels: string[];
  icon: string
  styles: {
    [key: string]: {
      text: string
      color?: ColorT
      size: number
      image?: HTMLImageElement
    }
  }
  onClick?: (e: MouseEvent, point: SampleT | undefined) => void
}

export type SampleT = {
  id: number
  label: string
  point: [number, number]
}

type BoundsT = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export default class Chart {
  canvas: HTMLCanvasElement
  samples: SampleT[]

  options: OptionsT
  ctx: CanvasRenderingContext2D
  transparency: number
  margin: number
  defaultDataBounds: BoundsT
  defaultPixelBounds: BoundsT
  pixelBounds: BoundsT
  dataBounds: BoundsT
  dataTrans: {
    offset: [number, number],
    scale: number
  }
  dragInfo: {
    start: [number, number],
    end: [number, number],
    offset: [number, number],
    isDragging: boolean
  }

  hoveredSample: SampleT | undefined
  selectedSample: SampleT | undefined
  #onClick?: (e: MouseEvent, point: SampleT | undefined) => any

  constructor(canvas: HTMLCanvasElement, samples: SampleT[], {
    // @typescript-eslint/no-unused-vars off
    axesLabels = ['X', 'Y'],
    // @typescript-eslint/no-unused-vars off
    styles = {},
    onClick
  }: OptionsT) {
    this.canvas = canvas
    this.samples = samples
    this.options = arguments[2]
    this.ctx = this.canvas.getContext('2d')!
    this.transparency = 0.45
    this.margin = this.canvas.width * 0.05
    this.pixelBounds = this.#getPixelBounds()
    this.dataBounds = this.#getDataBounds()
    this.defaultDataBounds = this.dataBounds
    this.defaultPixelBounds = this.pixelBounds
    this.dataTrans = {
      offset: [0, 0],
      scale: 1
    }
    this.dragInfo = {
      start: [0, 0],
      end: [0, 0],
      offset: [0, 0],
      isDragging: false
    }
    this.#onClick = onClick

    this.#draw()
    /*  this.init() */
    this.#addEventListeners()

  }

  setActiveSampleById(sampleId: number) {
    this.selectedSample = this.samples.find(s => s.id === sampleId)
    this.#draw()
  }

  #addEventListeners() {
    const { canvas, dataTrans, dragInfo } = this
    canvas.onmousedown = (e) => {
      const dataLoc = this.#getMousePos(e, 'data')
      dragInfo.start = dataLoc
      dragInfo.isDragging = true

      dragInfo.offset = [0, 0]

      dragInfo.end = [0, 0]
    }

    canvas.onmousemove = (e) => {
      const pixelLoc = this.#getMousePos(e)

      if (dragInfo.isDragging) {
        const dataLoc = mathUtils.remapPoint(this.pixelBounds, this.dataBounds, pixelLoc)
        dragInfo.end = dataLoc
        dragInfo.offset = mathUtils.subtract(dragInfo.start, dragInfo.end)
        const newOffset = mathUtils.add(dataTrans.offset, dragInfo.offset)
        this.#updateDataBounds(newOffset)
      }
      const samplesPointsPixelBoulds = this.samples.map(s => mathUtils.remapPoint(this.dataBounds, this.pixelBounds, s.point))
      const nearestIndex = mathUtils.getNearestPointIndex([pixelLoc[0] - 38, pixelLoc[1] - 8], samplesPointsPixelBoulds)
      this.hoveredSample = this.samples[nearestIndex]
      const nearestPointPixelBounds = samplesPointsPixelBoulds[nearestIndex]
      const distanceBetweenMouseAndNearest = Math.hypot(
        pixelLoc[0] - nearestPointPixelBounds[0],
        pixelLoc[1] - nearestPointPixelBounds[1]
      )
      if (distanceBetweenMouseAndNearest > 44) {
        this.hoveredSample = undefined
      }
      this.#draw()
    }

    canvas.onwheel = (e) => {
      e.preventDefault()
      const { dataTrans } = this
      const dir = Math.sign(e.deltaY)
      const stepRatio = 0.08
      const step = dir > 0 ? 1 + stepRatio : 1 - stepRatio
      if ((dataTrans.scale < 0.04 && dir < 0) || (dataTrans.scale > 4 && dir > 0)) return
      dataTrans.scale *= step
      this.#updateDataBounds(dataTrans.offset, step)

      this.#draw()
    }

    canvas.onmouseup = (_e) => {
      // const dataLoc = this.#getMousePos(e, 'data')
      // dragInfo.start = dataLoc
      dataTrans.offset = mathUtils.add(dataTrans.offset, dragInfo.offset)
      dragInfo.isDragging = false
      dragInfo.start = [0, 0]

    }

    canvas.onclick = (e) => {
      if (!mathUtils.equalPoints(dragInfo.offset, [0, 0])) return

      if (this.hoveredSample) {
        if (this.selectedSample && this.selectedSample.id === this.hoveredSample.id) {
          this.selectedSample = undefined
        } else {
          this.selectedSample = this.hoveredSample
        }
      } else {
        this.selectedSample = undefined
      }

      if (this.#onClick) {
        this.#onClick(e, this.selectedSample)
      }

      this.#draw()
    }
  }

  #updateDataBounds(offset = [0, 0], scale = 1) {
    const { dataBounds, defaultDataBounds } = this
    dataBounds.xMin = defaultDataBounds.xMin + offset[0]
    dataBounds.xMax = defaultDataBounds.xMax + offset[0]
    dataBounds.yMin = defaultDataBounds.yMin + offset[1]
    dataBounds.yMax = defaultDataBounds.yMax + offset[1]
    const center = mathUtils.getCenter(defaultDataBounds)
    dataBounds.xMin = mathUtils.lerp(center[0], dataBounds.xMin, scale)
    dataBounds.xMax = mathUtils.lerp(center[0], dataBounds.xMax, scale)
    dataBounds.yMin = mathUtils.lerp(center[1], dataBounds.yMin, scale)
    dataBounds.yMax = mathUtils.lerp(center[1], dataBounds.yMax, scale)
  }

  #getMousePos(e: MouseEvent, type: 'pixel' | 'data' = 'pixel') {
    const { canvas, defaultDataBounds } = this
    const rect = canvas.getBoundingClientRect()
    const pixelLoc: [number, number] = [
      e.clientX - rect.left,
      e.clientY - rect.top]
    return type === 'data' ? mathUtils.remapPoint(this.pixelBounds, defaultDataBounds, pixelLoc) : pixelLoc
  }

  #getPixelBounds() {
    const { canvas, margin } = this
    return {
      xMin: margin,
      xMax: canvas.width - margin,
      yMin: canvas.height - margin,
      yMax: margin
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
    this.#drawSamples(this.samples)

    if (this.hoveredSample) {
      this.#emphasizeSample(this.hoveredSample)
    }
    if (this.selectedSample) {
      this.#emphasizeSample(this.selectedSample, 'yellow')
    }
    this.#drawAxes()
  }

  #emphasizeSample(sample: SampleT, color = 'white') {


    const pixelLoc = mathUtils.remapPoint(this.defaultDataBounds, this.pixelBounds, sample.point)
    pixelLoc[0] = pixelLoc[0] + 34
    pixelLoc[1] = pixelLoc[1] + 8
    const grd = this.ctx.createRadialGradient(pixelLoc[0], pixelLoc[1], 0, pixelLoc[0], pixelLoc[1], 128)
    grd.addColorStop(0, color)
    grd.addColorStop(1, "rgba(255, 255, 255, 0)")
    this.ctx.globalAlpha = 0.88
    graphics.drawPoint(this.ctx, pixelLoc, {
      radius: 28,
      color: grd,
    })
    this.ctx.globalAlpha = 1
    this.#drawSample(sample)
  }

  #drawAxes() {
    const { ctx, canvas, options, margin } = this
    const { xMin, xMax, yMin, yMax } = this.pixelBounds

    graphics.drawText(ctx, {
      text: options.axesLabels[0],
      loc: [canvas.width / 2, yMin + margin / 2],
      size: margin * 0.4,
      color: 'white'
    })

    ctx.save()
    ctx.translate(xMin - margin / 2, canvas.height / 2)
    ctx.rotate(-Math.PI / 2)
    graphics.drawText(ctx, {
      text: options.axesLabels[1],
      loc: [0, 0],
      size: margin * 0.4,
      color: 'white'
    })
    ctx.restore()

    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.moveTo(xMin, yMax)
    ctx.lineTo(xMin, yMin)
    ctx.lineTo(xMax, yMin)
    ctx.setLineDash([5, 4])
    ctx.lineWidth = 2
    ctx.strokeStyle = 'white'
    ctx.stroke()
    ctx.setLineDash([])

    const dataMin = mathUtils.remapPoint(this.pixelBounds, this.dataBounds, [this.pixelBounds.xMin, this.pixelBounds.yMin])
    const dataMax = mathUtils.remapPoint(this.pixelBounds, this.dataBounds, [this.pixelBounds.xMax, this.pixelBounds.yMax])

    graphics.drawText(ctx, {
      text: `${dataMin[0].toFixed(1)}`,
      loc: [this.pixelBounds.xMin, this.pixelBounds.yMin],
      align: 'left',
      vAlign: 'top',
      size: margin * 0.28,
      color: 'white'
    })

    graphics.drawText(ctx, {
      text: `${dataMax[0].toFixed(1)}`,
      loc: [this.pixelBounds.xMax, this.pixelBounds.yMin],
      align: 'right',
      vAlign: 'top',
      size: margin * 0.28,
      color: 'white'
    })

    ctx.save()
    ctx.translate(this.pixelBounds.xMin, this.pixelBounds.yMin)
    ctx.rotate(-Math.PI / 2)

    graphics.drawText(ctx, {
      text: `${dataMin[1].toFixed(1)}`,
      loc: [0, 0],
      align: 'left',
      vAlign: 'bottom',
      size: margin * 0.28,
      color: 'white'
    })
    ctx.restore()

    ctx.save()
    ctx.translate(this.pixelBounds.xMin, this.pixelBounds.yMax)
    ctx.rotate(-Math.PI / 2)

    graphics.drawText(ctx, {
      text: `${dataMax[1].toFixed(1)}`,
      loc: [0, 0],
      align: 'right',
      vAlign: 'bottom',
      size: margin * 0.28,
      color: 'white'
    })
    ctx.restore()
  }

  #drawSample(sample: SampleT) {
    const { ctx, defaultDataBounds, pixelBounds, options } = this
    const pixelLoc = mathUtils.remapPoint(defaultDataBounds, pixelBounds, sample.point)
    const style = options.styles[sample.label]
    switch (options.icon) {
      case 'text':
        graphics.drawText(ctx, {
          text: style.text,
          loc: pixelLoc,
          color: style.color,
          size: style.size
        })
        break
      case 'image':

        ctx.drawImage(style.image!, pixelLoc[0], pixelLoc[1])
        break
      default:
        graphics.drawPoint(ctx, pixelLoc, {
          radius: 4,
          color: style.color
        })
    }

  }

  #drawSamples(samples: SampleT[]) {
    samples.forEach((this.#drawSample.bind(this)))
  }

}