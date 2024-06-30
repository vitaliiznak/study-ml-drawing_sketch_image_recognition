export type SampleT = {
  id: number
  label: string
  point: number[]
  studentName: string
}


export default class KNN {




  constructor(samples: any, k: number) {
    this.samples = samples
    this.k = k
  }
  // predict(sample) {
  //   const distances = this.samples.map((s) => {
  //     return {
  //       distance: this.distance(s.point, sample.point),
  //       label: s.label,
  //     }
  //   })
  //   distances.sort((a, b) => a.distance - b.distance)
  //   const kNearest = distances.slice(0, this.k)
  //   const labels = kNearest.map((n) => n.label)
  //   const counts = labels.reduce((acc, label) => {
  //     acc[label] = (acc[label] || 0) + 1
  //     return acc
  //   }, {})
  //   const maxCount = Math.max(...Object.values(counts))
  //   const predictedLabel = Object.keys(counts).find(
  //     (label) => counts[label] === maxCount,
  //   )
  //   return predictedLabel
  // }
  // distance(point1, point2) {
  //   return Math.sqrt(
  //     point1.reduce((acc, p1, i) => {
  //       const p2 = point2[i]
  //       return acc + (p1 - p2) ** 2
  //     }, 0),
  //   )
  // }
}