import fs from 'fs'
import { FEATURES, JSON_DIR, SAMPLES } from './constants.mjs'
import * as mathUtils from './mathUtils.mts'


export type SampleT = {
  id: number
  label: string
  point: number[]
}

const samples = JSON.parse(fs.readFileSync(SAMPLES, 'utf8')) as SampleT[]

const getPathCount = (paths: [number, number][][]) => {
  return paths.length
}

const getPointCount = (paths: [number, number][][]) => {
  const points = paths.flat()
  return points.length
}

const getHeights = (paths: [number, number][][]) => {
  const points = paths.flat()
  const heights = points.map((point) => point[1])
  const min = Math.min(...heights)
  const max = Math.max(...heights)
  return max - min
}

const getWidths = (paths: [number, number][][]) => {
  const points = paths.flat()
  const widths = points.map((point) => point[0])
  const min = Math.min(...widths)
  const max = Math.max(...widths)
  return max - min
}
export const inUse = [
  // {
  //   name: 'Path Count',
  //   function: getPathCount
  // },
  // {
  //   name: 'Point Count',
  //   function: getPointCount
  // },
  {
    name: 'Widths',
    function: getWidths
  },
  {
    name: 'Heights',
    function: getHeights
  }
]


const functions = inUse.map((feature) => feature.function)


for (const sample of samples) {
  const paths = JSON.parse(
    fs.readFileSync(`${JSON_DIR}/${sample.id}.json`, 'utf8')
  )
  sample.point = functions.map((func) => func(paths))
}


const featuresNames = inUse.map((feature) => feature.name)

const trainingAmount = samples.length * 0.5
const training = [];
const testing = [];
for (let i = 0; i < samples.length; i++) {
  if (i < trainingAmount) {
    training.push(samples[i])
  } else {
    testing.push(samples[i])
  }
}

const { min, max } = mathUtils.normalizePoints(training.map((sample) => sample.point))

mathUtils.normalizePoints(testing.map((sample) => sample.point), { min, max })



fs.writeFileSync(
  FEATURES,
  JSON.stringify(
    {
      featuresNames,
      samplesMinMax: { min, max },
      trainingSamples: training,
      testingSamples: testing
      /* : samples.map((sample) => {
        return {
          label: sample.label,
          point: sample.point
        }
      }),
      */

    },

    null,
    2
  )
)


console.log('Feature extraction completed!')
