import fs from 'fs'
import { FEATURES, JSON_DIR, SAMPLES } from './constants.mjs'

const samples = JSON.parse(fs.readFileSync(SAMPLES, 'utf8'))

const getPathCount = (paths: [number, number][][]) => {
  return paths.length
}

const getPointCount = (paths: [number, number][][]) => {
  const points = paths.flat()
  return points.length
}

for (const sample of samples) {
  const paths = JSON.parse(
    fs.readFileSync(`${JSON_DIR}/${sample.id}.json`, 'utf8')
  )

  sample.point = [getPathCount(paths), getPointCount(paths)]
}

const featuresNames = ['Path Count', 'Point Count']

fs.writeFileSync(
  FEATURES,
  JSON.stringify(
    {
      featuresNames,
      samples
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
