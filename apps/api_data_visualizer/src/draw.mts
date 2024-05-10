import { CanvasRenderingContext2D } from "canvas";

export const drawPath = (
  ctx: CanvasRenderingContext2D,
  path: [number, number][],
  color = "black"
) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(...path[0]);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(...path[i]);
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
};

export const drawPaths = (ctx: CanvasRenderingContext2D, paths: [number, number][][], color = "black") => {
  for (const path of paths) {
    drawPath(ctx, path, color);
  }
};
