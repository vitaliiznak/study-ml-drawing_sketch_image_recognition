const drawPoint = (
  ctx: CanvasRenderingContext2D,
  loc: [number, number],
  {
    radius = 8,
    color = 'black'
  }: {
    radius?: number
    color?: string | CanvasGradient | CanvasPattern
    icon?: string
  }
) => {
  ctx.beginPath()
  ctx.fillStyle = color
  ctx.arc(loc[0], loc[1], radius, 0, Math.PI * 2)
  ctx.fill()
}

const drawText = (
  ctx: CanvasRenderingContext2D,
  loc: [number, number],
  {
    text,
    align = 'center',
    vAlign = 'middle',
    size = 28,
    color = 'black'
  }: {
    text: string
    align?: CanvasTextAlign
    vAlign?: CanvasTextBaseline
    size?: number
    color?: string
  }
) => {
  ctx.textAlign = align
  ctx.textBaseline = vAlign
  ctx.font = `${size}px Courier New`
  ctx.fillStyle = color
  ctx.strokeStyle = color

  ctx.fillStyle = color

  ctx.fillText(text, ...loc)
}

export type ColorT =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'magenta'
  | 'pink'
  | 'lightgray'
  | 'gray'

const colorHueMap: {
  [key in ColorT]: number
} = {
  red: 0,
  orange: 30,
  yellow: 60,
  lime: 90,
  green: 120,
  cyan: 180,
  blue: 240,
  purple: 280,
  magenta: 300,
  pink: 320,
  lightgray: 0, // No hue adjustment needed
  gray: 0 // No hue adjustment needed
}

const generateImagesAndAddToStyles = (styles: {
  [key: string]: {
    text?: string
    color?: ColorT
    size?: number
    image?: HTMLImageElement
  }
}) => {
  for (let key in styles) {
    const style = styles[key]
    style.size = style.size || 10
    const canvas = document.createElement('canvas')
    canvas.width = style.size
    canvas.height = style.size + 20
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get 2d context')
    }
    // eslint-disable-next-line
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    canvas.height = style.size
    ctx.font = `${style.size}px Courier New`
    ctx.beginPath()

    if (
      colorHueMap[style.color as ColorT] !== undefined &&
      style.color !== 'lightgray' &&
      style.color !== 'gray'
    ) {
      // eslint-disable-next-line
      const hue = -45 + colorHueMap[style.color as ColorT]
      ctx.filter = `
      brightness(2)
      contrast(0.6)
      sepia(1)
      brightness(0.7)
      hue-rotate(${hue}deg)
      brightness(0.9)
      saturate(3)
      contrast(3)
`
    } else {
      ctx.filter =
        style.color === 'lightgray'
          ? 'brightness(1.25) grayscale(100%)'
          : 'grayscale(100%)'
    }
    ctx.fillText(style.text || '', 0, canvas.height)
    ctx.fill()

    style.image = new Image()
    style.image.src = canvas.toDataURL()
  }
}

const drawImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  loc: [number, number]
) => {
  ctx.beginPath()
  ctx.drawImage(
    image,
    loc[0] - image.width / 2,
    loc[1] - image.height / 2,
    image.width,
    image.height
  )
  // ctx.strokeStyle = 'blue';
  // ctx.lineWidth = 1;
  // ctx.strokeRect(loc[0] - image.width / 2, loc[1] - image.height / 2, image.width, image.height)
  // ctx.stroke()
  ctx.fill()
}

export default {
  drawPoint,
  drawText,
  generateImagesAndAddToStyles,
  drawImage
}
