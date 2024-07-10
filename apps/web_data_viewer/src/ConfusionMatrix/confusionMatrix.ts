class ConfusionMatrix {
  container: HTMLCanvasElement
  samples: number[]
  classes: string[]
  options: Record<string, any>
  N: number
  cellSize: number

  constructor(
    container: HTMLCanvasElement,
    samples: number[],
    classes: string[],
    options: Record<string, any> = {}
  ) {
    this.container = container
    this.samples = samples
    this.classes = classes
    this.options = options
    this.N = this.samples.length + 1
    this.cellSize = this.container.width / this.N
  }
}
