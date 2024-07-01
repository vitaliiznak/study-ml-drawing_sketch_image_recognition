const lerp = (a: number, b: number, t: number) => {
  return a + (b - a) * t
}

const invLerp = (a: number, b: number, v: number) => {
  return (v - a) / (b - a)
}

const remap = (
  oldA: number,
  oldB: number,
  newA: number,
  newB: number,
  v: number,
) => {
  return lerp(newA, newB, invLerp(oldA, oldB, v))
}

type BoundsT = {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}
const remapPoint = (
  oldBounds: BoundsT,
  newBounds: BoundsT,
  point: number[],
): [number, number] => {
  return [
    remap(
      oldBounds.xMin,
      oldBounds.xMax,
      newBounds.xMin,
      newBounds.xMax,
      point[0],
    ),
    remap(
      oldBounds.yMin,
      oldBounds.yMax,
      newBounds.yMin,
      newBounds.yMax,
      point[1],
    ),
  ]
}

const add = (a: [number, number], b: [number, number]): [number, number] => {
  return [a[0] + b[0], a[1] + b[1]]
}

const subtract = (
  a: [number, number],
  b: [number, number],
): [number, number] => {
  return [a[0] - b[0], a[1] - b[1]]
}

const getCenter = (bounds: BoundsT): [number, number] => {
  return [(bounds.xMin + bounds.xMax) / 2, (bounds.yMin + bounds.yMax) / 2]
}

const getNearestPoints = (point: number[], points: number[][], k = 1) => {
  let nearestPoints = points
    .map((p, i) => {
      return {
        distance: Math.hypot(p[0] - point[0], p[1] - point[1]),
        index: i,
      }
    })
    .sort((a, b) => a.distance - b.distance)
  return nearestPoints.slice(0, k).map(p => p.index)
}

const equalPoints = (a: [number, number], b: [number, number]) => {
  return a[0] === b[0] && a[1] === b[1]
}

const normalizePoints = (
  points: number[][],
  minMax:
    | {
        min: number[]
        max: number[]
      }
    | undefined,
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
  points.map(point => {
    return point.map((value, index) => {
      point[index] = invLerp(min[index], max[index], value)
    })
  })
  return { min, max }
}

export default {
  lerp,
  invLerp,
  remap,
  remapPoint,
  add,
  subtract,
  getCenter,
  getNearestPoints,
  equalPoints,
  normalizePoints,
}
