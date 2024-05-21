


const drawPoint = (ctx: CanvasRenderingContext2D, loc: [number, number], radius: number = 4) => {
  ctx.beginPath()
  ctx.fillStyle = 'black'
  ctx.arc(...loc, radius, 0, Math.PI * 2)
  ctx.fill()
}


const drawText = (ctx: CanvasRenderingContext2D, {
  text,
  loc,
  align = 'center',
  vAlign = 'middle',
  size = 18,
  color = 'red'
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
  ctx.strokeStyle = 'red';

  ctx.fillStyle = "red";


  ctx.fillText(text, ...loc)


}




export default {
  drawPoint,
  drawText
}