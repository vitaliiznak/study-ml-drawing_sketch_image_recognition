const lerp = (a: number, b: number, t: number) => {
  return a + (b - a) * t
}

const invLerp = (a: number, b: number, v: number) => {
  return (v - a) / (b - a)
}

const remap = (oldA: number, oldB: number, newA: number, newB: number, v: number) => {
  return lerp(newA, newB, invLerp(oldA, oldB, v))
}

type BoundsT = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}
const remapPoint = (oldBounds: BoundsT, newBounds:
  BoundsT, point: [number, number]): [
    number, number
  ] => {
  return [
    remap(
      oldBounds.xMin,
      oldBounds.xMax,
      newBounds.xMin,
      newBounds.xMax,
      point[0]),
    remap(
      oldBounds.yMin,
      oldBounds.yMax,
      newBounds.yMin,
      newBounds.yMax,
      point[1])]
}


export default { lerp, invLerp, remap, remapPoint }