import mathUtils from '../mathUtils'

export type SampleT = {
  id: number
  label: string
  point: number[]
  studentName: string
}

export default class KNN {
  samples: SampleT[]
  k: number

  constructor(samples: any, k: number) {
    this.samples = samples
    this.k = k
  }
  predict(point: number[]): {
    label: string
    nearestSamples: SampleT[]
  } {
    const samplePoints = this.samples.map(s => s.point)
    const indices = mathUtils.getNearestPoints(point, samplePoints, this.k)
    const nearestSamples = indices.map((index: number) => this.samples[index])
    const labels = nearestSamples.map((sample: SampleT) => sample.label)
    const labelCounts: Record<string, number> = labels.reduce(
      (acc: Record<string, number>, label: string) => {
        acc[label] = (acc[label] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    const max = Math.max(...Object.values(labelCounts))
    const label = labels.find((label: string) => labelCounts[label] === max)!
    return { label, nearestSamples }
  }
}
