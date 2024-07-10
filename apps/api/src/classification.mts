import { DECISION_BOUNDARY, FEATURES, LABEL_COLORS } from './constants.mjs'
import { printProgress } from './utils.mjs'
import { SampleT, KNN } from '@signumcode/ml-libs/dist/classifiers/knn'
import fs from 'fs'
import { createCanvas } from 'canvas'

export type FeaturesT = {
  trainingSamples: Array<SampleT>
  testingSamples: Array<SampleT>
  featuresNames: string[]
  samplesMinMax: {
    min: number[]
    max: number[]
  }
}

console.log('Running classification...')

const features = JSON.parse(fs.readFileSync(FEATURES, 'utf8')) as FeaturesT

const trainingSamples = features.trainingSamples

const kNN = new KNN(trainingSamples, 80)

let totalCount = 0
let correctCount = 0
for (const sample of features.testingSamples) {
  const { label: predictedLabel } = kNN.predict(sample.point)
  totalCount++
  if (predictedLabel === sample.label) {
    correctCount++
  }

  printProgress(totalCount, features.testingSamples.length)
}

console.log(`\nAccuracy: ${(correctCount / totalCount) * 100}%`)

console.log('Generating decision boundary...')
const canvas = createCanvas(180, 180)
const ctx = canvas.getContext('2d')

for (let x = 0; x < canvas.width; x++) {
  for (let y = 0; y < canvas.height; y++) {
    const point = [x / canvas.width, 1 - y / canvas.height]
    const { label } = kNN.predict(point)
    const color = LABEL_COLORS[label as keyof typeof LABEL_COLORS]
    ctx.fillStyle = color
    ctx.fillRect(x, y, 1, 1)
  }
}

const buffer = canvas.toBuffer('image/png')
fs.writeFileSync(DECISION_BOUNDARY, buffer)

console.log('DONE!')
