


const drawPoint = (ctx: CanvasRenderingContext2D, loc: [number, number], radius: number = 4) => {
  ctx.beginPath()
  ctx.fillStyle = 'black'
  ctx.arc(...loc, radius, 0, Math.PI * 2)
  ctx.fill()
}


export default {
  drawPoint
}