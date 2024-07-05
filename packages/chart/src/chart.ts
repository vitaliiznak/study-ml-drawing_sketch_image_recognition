import graphics, { ColorT } from './graphics'
import mathUtils from '@signumcode/ml-libs/dist/mathUtils'

export type OptionsT = {
  axesLabels: string[]
  icon?: string
  styles: {
    [key: string]: {
      text?: string
      color?: ColorT
      size?: number
      image?: HTMLImageElement
    }
  }
  background?: HTMLImageElement
  onClick?: (e: MouseEvent, point: SampleT | undefined) => void
}

export type SampleT = {
  studentId?: string
  id: number
  label: string
  point: number[]
}

type BoundsT = {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
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
    offset: [number, number]
    scale: number
  }
  dragInfo: {
    start: [number, number]
    end: [number, number]
    offset: [number, number]
    isDragging: boolean
  }
  background?: HTMLImageElement

  dynamicSample: SampleT | undefined
  nearestSamples: SampleT[] = []

  hoveredSample: SampleT | undefined
  selectedSample: SampleT | undefined
  #onClick?: (e: MouseEvent, point: SampleT | undefined) => any

  constructor(
    canvas: HTMLCanvasElement,
    samples: SampleT[],
    {
      // @typescript-eslint/no-unused-vars off
      axesLabels = ['X', 'Y'],
      // @typescript-eslint/no-unused-vars off
      styles = {},
      onClick
    }: OptionsT
  ) {
    this.canvas = canvas
    this.samples = samples
    this.options = arguments[2]
    this.background = this.options.background
    this.ctx = this.canvas.getContext('2d')!
    this.ctx.imageSmoothingEnabled = false
    this.transparency = 0.58
    this.margin = 40
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

  hideDynamicSample() {
    this.dynamicSample = undefined
    this.#draw()
  }

  showDynamicSample(sample: SampleT, nearestSamples: SampleT[] = []) {
    this.dynamicSample = sample
    this.nearestSamples = nearestSamples
    this.#draw()
  }

  #addEventListeners() {
    const { canvas, dataTrans, dragInfo } = this
    canvas.onmousedown = e => {
      const dataLoc = this.#getMousePos(e, 'data')
      dragInfo.start = dataLoc
      dragInfo.isDragging = true

      dragInfo.offset = [0, 0]

      dragInfo.end = [0, 0]
    }

    canvas.onmousemove = e => {
      const pixelLoc = this.#getMousePos(e)

      if (dragInfo.isDragging) {
        const dataLoc = mathUtils.remapPoint(
          this.pixelBounds,
          this.dataBounds,
          pixelLoc
        )
        dragInfo.end = dataLoc
        dragInfo.offset = mathUtils.subtract(dragInfo.start, dragInfo.end)
        const newOffset = mathUtils.add(dataTrans.offset, dragInfo.offset)
        this.#updateDataBounds(newOffset)
      }
      const samplesPointsPixelBoulds = this.samples.map(s =>
        mathUtils.remapPoint(this.dataBounds, this.pixelBounds, s.point)
      )
      const nearestIndeces = mathUtils.getNearestPoints(
        [pixelLoc[0], pixelLoc[1] - 8],
        samplesPointsPixelBoulds
      )
      this.hoveredSample = this.samples[nearestIndeces[0]]
      const nearestPointPixelBounds =
        samplesPointsPixelBoulds[nearestIndeces[0]]
      const distanceBetweenMouseAndNearest = Math.hypot(
        pixelLoc[0] - nearestPointPixelBounds[0],
        pixelLoc[1] - nearestPointPixelBounds[1]
      )
      if (distanceBetweenMouseAndNearest > 44) {
        this.hoveredSample = undefined
      }
      this.#draw()
    }

    canvas.onwheel = e => {
      e.preventDefault()
      const { dataTrans } = this
      const dir = Math.sign(e.deltaY)
      const stepRatio = 0.08
      const step = dir > 0 ? 1 + stepRatio : 1 - stepRatio
      if (
        (dataTrans.scale < 0.002 && dir < 0) ||
        (dataTrans.scale > 30 && dir > 0)
      ) {
        return
      }
      dataTrans.scale *= step
      this.#updateDataBounds(dataTrans.offset, step)

      this.#draw()
    }

    canvas.onmouseup = _e => {
      // const dataLoc = this.#getMousePos(e, 'data')
      // dragInfo.start = dataLoc
      dataTrans.offset = mathUtils.add(dataTrans.offset, dragInfo.offset)
      dragInfo.isDragging = false
      dragInfo.start = [0, 0]
    }

    canvas.onclick = e => {
      if (!mathUtils.equalPoints(dragInfo.offset, [0, 0])) return

      if (this.hoveredSample) {
        if (
          this.selectedSample &&
          this.selectedSample.id === this.hoveredSample.id
        ) {
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
    const { canvas, dataBounds } = this
    const rect = canvas.getBoundingClientRect()
    const pixelLoc: [number, number] = [
      e.clientX - rect.left,
      e.clientY - rect.top
    ]
    return type === 'data'
      ? mathUtils.remapPoint(this.pixelBounds, dataBounds, pixelLoc)
      : pixelLoc
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
    const deltaX = xMax - xMin
    const deltaY = yMax - yMin
    const maxDelta = Math.max(deltaX, deltaY)
    console.log({
      deltaX,
      deltaY
    })
    return {
      xMin: xMin,
      xMax: xMin + maxDelta,
      yMin,
      yMax: yMin + maxDelta
    }
  }

  #draw() {
    const { ctx, canvas } = this
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (this.background) {
      ctx.globalAlpha = 0.2
      const topLeft = mathUtils.remapPoint(
        this.dataBounds,
        this.pixelBounds,
        [0, 1]
      )
      const size = (canvas.width - this.margin * 2) / this.dataTrans.scale
      ctx.drawImage(this.background, topLeft[0], topLeft[1], size, size)
      ctx.globalAlpha = 1
    }
    ctx.globalAlpha = this.transparency
    this.#drawSamples(this.samples)
    if (this.dynamicSample) {
      const pixelLoc = mathUtils.remapPoint(
        this.dataBounds,
        this.pixelBounds,
        this.dynamicSample.point
      )
      graphics.drawPoint(ctx, pixelLoc, {
        radius: 70,
        color: 'rgba(21, 21, 21, 0.7)'
      })

      this.nearestSamples.forEach(nearestSample => {
        const nearestPixelLoc = mathUtils.remapPoint(
          this.dataBounds,
          this.pixelBounds,
          nearestSample.point
        )

        ctx.beginPath()
        ctx.moveTo(...pixelLoc)

        ctx.lineTo(...nearestPixelLoc)
        ctx.strokeStyle = 'rgba(21, 21, 21, 0.7)'
        ctx.lineWidth = 3
        ctx.stroke()
      })
      graphics.drawImage(
        ctx,
        this.options.styles[this.dynamicSample.label].image!,
        pixelLoc
      )
    }

    ctx.clearRect(0, 0, this.pixelBounds.xMin, this.canvas.height)

    ctx.clearRect(
      0,
      this.pixelBounds.yMin,
      this.canvas.width,
      this.canvas.height
    )

    ctx.globalAlpha = 1
    this.#drawAxes()

    if (this.hoveredSample) {
      this.#emphasizeSample(this.hoveredSample)
    }
    if (this.selectedSample) {
      this.#emphasizeSample(this.selectedSample, 'green')
    }
  }

  #emphasizeSample(sample: SampleT, color = 'pink') {
    const pixelLoc = mathUtils.remapPoint(
      this.dataBounds,
      this.pixelBounds,
      sample.point
    )
    const grd = this.ctx.createRadialGradient(
      pixelLoc[0],
      pixelLoc[1],
      0,
      pixelLoc[0],
      pixelLoc[1],
      50
    )
    grd.addColorStop(0, color)
    grd.addColorStop(1, 'rgba(255, 255, 255, 0.24)')
    this.ctx.globalAlpha = 1
    graphics.drawPoint(this.ctx, pixelLoc, {
      radius: 25,
      color: grd
    })
    this.ctx.globalAlpha = 1
    this.#drawSample(sample)
  }

  #drawAxes() {
    const { ctx, canvas, options, margin } = this
    const { xMin, xMax, yMin, yMax } = this.pixelBounds

    graphics.drawText(ctx, [canvas.width / 2, yMin + margin / 2], {
      text: options.axesLabels[0],
      size: margin * 0.4,
      color: 'black'
    })

    ctx.save()
    ctx.translate(xMin - margin / 2, canvas.height / 2)
    ctx.rotate(-Math.PI / 2)
    graphics.drawText(ctx, [0, 0], {
      text: options.axesLabels[1],
      size: margin * 0.4,
      color: 'black'
    })
    ctx.restore()

    ctx.beginPath()
    ctx.fillStyle = 'black'
    ctx.moveTo(xMin, yMax)
    ctx.lineTo(xMin, yMin)
    ctx.lineTo(xMax, yMin)
    ctx.setLineDash([5, 4])
    ctx.lineWidth = 2
    ctx.strokeStyle = 'black'
    ctx.stroke()
    ctx.setLineDash([])

    const dataMin = mathUtils.remapPoint(this.pixelBounds, this.dataBounds, [
      this.pixelBounds.xMin,
      this.pixelBounds.yMin
    ])
    const dataMax = mathUtils.remapPoint(this.pixelBounds, this.dataBounds, [
      this.pixelBounds.xMax,
      this.pixelBounds.yMax
    ])

    graphics.drawText(ctx, [this.pixelBounds.xMin, this.pixelBounds.yMin], {
      text: `${dataMin[0].toFixed(1)}`,
      align: 'left',
      vAlign: 'top',
      size: margin * 0.28,
      color: 'black'
    })

    graphics.drawText(ctx, [this.pixelBounds.xMax, this.pixelBounds.yMin], {
      text: `${dataMax[0].toFixed(1)}`,
      align: 'right',
      vAlign: 'top',
      size: margin * 0.28,
      color: 'black'
    })

    ctx.save()
    ctx.translate(this.pixelBounds.xMin, this.pixelBounds.yMin)
    ctx.rotate(-Math.PI / 2)

    graphics.drawText(ctx, [0, 0], {
      text: `${dataMin[1].toFixed(1)}`,
      align: 'left',
      vAlign: 'bottom',
      size: margin * 0.28,
      color: 'black'
    })
    ctx.restore()

    ctx.save()
    ctx.translate(this.pixelBounds.xMin, this.pixelBounds.yMax)
    ctx.rotate(-Math.PI / 2)

    graphics.drawText(ctx, [0, 0], {
      text: `${dataMax[1].toFixed(1)}`,
      align: 'right',
      vAlign: 'bottom',
      size: margin * 0.28,
      color: 'black'
    })
    ctx.restore()
  }

  #drawSample(sample: SampleT) {
    const { ctx, pixelBounds, options } = this
    const pixelLoc = mathUtils.remapPoint(
      this.dataBounds,
      pixelBounds,
      sample.point
    )
    const style = options.styles[sample.label] || {}

    switch (options.icon) {
      case 'text':
        graphics.drawText(ctx, pixelLoc, {
          text: style.text || '',
          color: style.color,
          size: style.size
        })
        break
      case 'image':
        graphics.drawImage(ctx, style.image!, pixelLoc)
        break
      default:
        graphics.drawPoint(ctx, pixelLoc, {
          radius: 18,
          color: style.color
        })
    }
  }

  #drawSamples(samples: SampleT[]) {
    samples.forEach(this.#drawSample.bind(this))
  }
}
