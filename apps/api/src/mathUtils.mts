type PointMultiDimensional = number[]


const invLerp = (a: number, b: number, v: number) => {
  return (v - a) / (b - a)
}

const normalizePoints = (points: number[][], minMax?: {
  min: number[],
  max: number[]
}
) => {
  let min = Array(points[0].length).fill(Infinity)
  let max = Array(points[0].length).fill(-Infinity)
  if (minMax) {
    min = minMax.min
    max = minMax.max
  } else {
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < points[i].length; j++) {
        min[j] = Math.min(min[j], points[i][j])
        max[j] = Math.max(max[j], points[i][j])
      }
    }
  }
  points.map((point) => {
    return point.map((value, index) => {
      point[index] = invLerp(min[index], max[index], value)
    })
  })
  return { min, max }
}


export {
  invLerp,
  normalizePoints
}