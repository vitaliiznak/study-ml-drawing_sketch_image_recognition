import { FEATURES } from './constants.mjs'
import { printProgress } from './utils.mjs'
import KNN, { SampleT } from './classifiers/knn.mts'
import fs from 'fs'






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

const features = JSON.parse(
  fs.readFileSync(FEATURES, 'utf8')
) as FeaturesT

const trainingSamples = features.trainingSamples

const kNN = new KNN(trainingSamples, 50)

let totalCount = 0
let correctCount = 0
for (const sample of features.testingSamples) {
  const predictedLabel = kNN.predict(sample)
  totalCount++
  if (predictedLabel === sample.label) {
    correctCount++
  }

  printProgress(totalCount, features.testingSamples.length)
}

console.log(`\nAccuracy: ${(correctCount / totalCount) * 100}%`





