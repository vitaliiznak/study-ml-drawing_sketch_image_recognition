


const drawPoint = (
  ctx: CanvasRenderingContext2D,
  loc: [number, number],
  {
    radius = 4,
    color = 'black',
    icon = undefined
  }:
    {
      radius?: number,
      color?: string,
      icon?: string
    }) => {
  ctx.beginPath()
  ctx.fillStyle = color
  ctx.arc(...loc, radius, 0, Math.PI * 2)
  ctx.fill()
}


const drawText = (ctx: CanvasRenderingContext2D, {
  text,
  loc,
  align = 'center',
  vAlign = 'middle',
  size = 18,
  color = 'black'
}: {
  text: string,
  loc: [number, number],
  align?: CanvasTextAlign,
  vAlign?: CanvasTextBaseline,
  size?: number,
  color?: string
}) => {
  ctx.textAlign = align
  ctx.textBaseline = vAlign
  ctx.font = `${size}px Courier New`
  ctx.fillStyle = color
  ctx.strokeStyle = color

  ctx.fillStyle = color


  ctx.fillText(text, ...loc)


}




export default {
  drawPoint,
  drawText
}