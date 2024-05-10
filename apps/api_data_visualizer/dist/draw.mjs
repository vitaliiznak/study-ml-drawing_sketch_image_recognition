export const drawPath = (ctx, path, color = "black") => {
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
export const drawPaths = (ctx, paths, color = "black") => {
    for (const path of paths) {
        drawPath(ctx, path, color);
    }
};
//# sourceMappingURL=draw.mjs.map