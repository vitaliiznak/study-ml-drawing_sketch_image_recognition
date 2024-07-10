import {
  Accessor,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  onMount,
  type Component
} from 'solid-js'
import { css } from '@emotion/css'

import Chart, { graphics } from '@signumcode/chart'
import { SampleT } from '@signumcode/chart/dist/chart'
import mathUtilsAll from '@signumcode/ml-libs/dist/mathUtils'
import DataRows from './DataRows'
import { BASE_URL, CLASSES } from './constants'
import SketchPad from './Sketchpad/sketchpad'

const mathUtils = mathUtilsAll

const SKETCPAD_WIDTH = 400
const SKETCPAD_HEIGHT = 400
const k = 50

export type FeaturesT = {
  trainingSamples: Array<SampleT>
  testingSamples: Array<
    SampleT & {
      trueLabel: string
      isCorrect: boolean
      studentName: string
      predictedLabel: string
    }
  >
  featuresNames: string[]
  samplesMinMax: {
    min: number[]
    max: number[]
  }
}

const fetchFeatures = async () => {
  const response = await fetch(`${BASE_URL}/dataset/features.json`)
  if (!response.ok) {
    throw new Error('Failed to fetch samples')
  }
  const features = await response.json()

  features.testingSamples = features.testingSamples.map((sample: any) => {
    const sampleTesting = {
      ...sample,
      trueLabel: sample.label,
      label: '?'
    }
    return sampleTesting
  })
  return features as FeaturesT
}

type ChartConstructorParams = ConstructorParameters<typeof Chart>

const getPathCount = (paths: [number, number][][]) => {
  return paths.length
}

const getPointCount = (paths: [number, number][][]) => {
  const points = paths.flat()
  return points.length
}

const getHeights = (paths: [number, number][][]) => {
  const points = paths.flat()
  const heights = points.map(point => point[1])
  const min = Math.min(...heights)
  const max = Math.max(...heights)
  return max - min
}

const getWidths = (paths: [number, number][][]) => {
  const points = paths.flat()
  const widths = points.map(point => point[0])
  const min = Math.min(...widths)
  const max = Math.max(...widths)
  return max - min
}

const inUse = [
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

const inUseFunctions = inUse.map(feature => feature.function)

const ConfusionMatrix: Component<{
  samples: Accessor<
    Array<
      SampleT & {
        trueLabel: string
        isCorrect: boolean
        studentName: string
        predictedLabel: string
      }
    >
  >
  classes: string[]
}> = ({ samples, classes }) => {
  let containerRef: HTMLTableElement
  const [cellWidth, setCellWidth] = createSignal(0)
  const [cellHeight, setCellHeight] = createSignal(0)
  const N = classes.length
  const matrix = createMemo(() => {
    const matrixToReturn = Array.from({ length: N }, () => Array(N).fill(0))

    for (const s of samples()) {
      const i = classes.indexOf(s.trueLabel)
      const j = classes.indexOf(s.predictedLabel)

      matrixToReturn[i][j]++
    }
    return matrixToReturn
  })
  onMount(() => {
    if (containerRef) {
      setCellWidth(containerRef.offsetWidth)
      setCellHeight(containerRef.offsetHeight)
    }
  })

  // const cellSize =
  return (
    <div
      class={css`
        display: relative;
        height: 100%;
        width: 100%;
      `}
    >
      <div>Predicted Class</div>
      <table
        ref={r => {
          containerRef = r
        }}
        class={css`
          border-collapse: collapse;
          text-align: center;
          margin-left: ${cellWidth()}px;
          margin-top: ${cellHeight()}px;
          height: 100%;
          width: 100%;
        `}
      >
        <tbody>
          <tr>
            <td
              class={css`
                height: ${cellHeight()}px;
                width: ${cellWidth()}px;
              `}
            ></td>
            {classes.map(c => (
              <td
                class={css`
                  height: ${cellHeight()}px;
                  width: ${cellWidth()}px;
                `}
              >
                {c}
              </td>
            ))}
          </tr>
          {matrix().map((row, i) => (
            <tr>
              <td
                class={css`
                  height: ${cellHeight()}px;
                  width: ${cellWidth()}px;
                `}
              >
                {classes[i]}
              </td>
              {row.map((count, j) => (
                <td
                  class={css`
                    height: ${cellHeight()}px;
                    width: ${cellWidth()}px;
                  `}
                >
                  {count}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const classify = (
  point: number[],
  samples: SampleT[],
  minMax?: {
    min: number[]
    max: number[]
  }
) => {
  const samplePoints = samples.map(s => s.point) as [number, number][]
  const normalizedPoint = structuredClone(point)
  if (minMax) {
    mathUtils.normalizePoints([normalizedPoint], minMax)
  }
  const indeces = mathUtils.getNearestPoints(normalizedPoint, samplePoints, k)
  const nearestSamples = indeces.map(index => samples[index])
  const labels = nearestSamples.map(sample => sample.label)
  const labelCounts = labels.reduce(
    (acc, label) => {
      acc[label] = (acc[label] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const maxLabel = Object.keys(labelCounts).reduce((a, b) =>
    labelCounts[a] > labelCounts[b] ? a : b
  )
  return { predictedLabel: maxLabel, nearestSamples }
}

const App: Component = () => {
  let chart: Chart
  let sketchpadCanvasRef: HTMLCanvasElement

  let chartCanvasRef: HTMLCanvasElement | undefined
  let sketchpad: SketchPad

  const [predictedLabel, setPredictedLabel] = createSignal('')
  const [isSketchpadVisible, setIsScketchpadVisible] = createSignal(false)
  const [plotType, setPlotType] = createSignal<
    'featuresPlot' | 'confusionPlot'
  >('featuresPlot')
  const [emphasizedSampleId, setEmphasizedRowId] = createSignal<number | null>(
    null
  )
  const [features, { refetch: refetchFeatres }] = createResource(fetchFeatures)

  const trainingSamples = createMemo(() => {
    return features()?.trainingSamples || []
  })

  const testingSamples = createMemo(() => {
    const featuresData = features()
    if (!featuresData) return []

    return featuresData.testingSamples.map(sample => {
      const { predictedLabel } = classify(
        sample.point,
        featuresData.trainingSamples
      )
      sample.isCorrect = sample.trueLabel === predictedLabel
      sample.predictedLabel = predictedLabel
      return sample
    })
  })

  const onDrawingsUpdate = (paths: [number, number][][]) => {
    const point = inUseFunctions.map(func => func(paths)) as [number, number]
    const featuresMinMax = features()?.samplesMinMax
    const trainingSamles = features()!.trainingSamples
    const { predictedLabel, nearestSamples } = classify(
      point,
      trainingSamles,
      featuresMinMax
    )
    const label = predictedLabel
    mathUtils.normalizePoints([point], featuresMinMax)
    const sample = {
      id: -1,
      label: label || 'dynamic point',
      point
    }
    chart.showDynamicSample(sample, nearestSamples)

    setPredictedLabel(predictedLabel)
  }

  onCleanup(() => {
    // google.visualization.events.removeAllListeners(window)
  })

  createEffect(() => {
    if (features.loading || chartCanvasRef === undefined) {
      return null // or some loading state/data
    }
    const options: ChartConstructorParams[2] = {
      axesLabels: features()!.featuresNames,
      styles: {
        car: { color: 'red', text: '🚗', size: 28 },
        fish: { color: 'blue', text: '🐟', size: 28 },
        house: { color: 'yellow', text: '🏠', size: 28 },

        tree: { color: 'green', text: '🌲', size: 28 },
        bicycle: { color: 'cyan', text: '🚲', size: 28 },
        guitar: { color: 'lime', text: '🎸', size: 28 },

        pencil: { color: 'magenta', text: '🖌️', size: 28 },
        clock: { color: 'lightgray', text: '🕒', size: 28 },
        ['?']: { color: 'gray', text: '❓', size: 28 }
      },
      icon: 'image',
      background: new Image(),

      onClick: (_e, sample) => {
        if (sample) {
          setEmphasizedRowId(sample.id)
        } else {
          setEmphasizedRowId(null)
        }
      }
    }
    if (options.background) {
      options.background.src = `${BASE_URL}/dataset/decision_boundary.png`
    }

    graphics.generateImagesAndAddToStyles(options.styles)

    setTimeout(() => {
      chart = new Chart(
        chartCanvasRef!,
        [...features()!.trainingSamples],
        options
      )
      // confusion = new Confusion(
      //   confusionCanvasRef!,
      //   [...features()!.trainingSamples],
      //  CLASSES,
      //  options
      // )

      sketchpad = new SketchPad(sketchpadCanvasRef, {
        onUpdate: onDrawingsUpdate
      })
    }, 400)
  })

  createEffect(() => {
    if (!isSketchpadVisible()) {
      chart?.hideDynamicSample()
    } else {
      sketchpad?.triggerUpdate()
    }
  })

  const onDataRowsSampleClick = (
    sample: Pick<SampleT, 'id' | 'label' | 'point'>
  ) => {
    setEmphasizedRowId(sample.id)
    if (sample.label === '?') {
      chart.showDynamicSample(sample, [])
    } else if (chart) {
      chart.hideDynamicSample()
      chart.setActiveSampleById(sample.id)
    }
  }

  return (
    <div
      class={css`
        background-color: skyblue;
        height: max-content;
        min-width: max-content;
        width: auto;
      `}
    >
      <header>Data viewer</header>

      <div
        class={css`
          display: flex;
          height: 100%;
        `}
      >
        <div
          class={css`
            display: flex;
            flex-direction: column;
          `}
        >
          <DataRows
            testingSamples={testingSamples}
            trainingSamples={trainingSamples}
            featuresNames={features()?.featuresNames || []}
            emphasizedSampleId={emphasizedSampleId}
            onSample={onDataRowsSampleClick}
          />
        </div>

        <div
          class={css`
            height: fit-content;
            min-width: 800px;
            width: fit-content;
            position: fixed;
            top: 90px;
            right: 0;
          `}
        >
          <div
            class={css`
              label: sketchpad-container;
              position: absolute;
              top: 0px;
              left: -${SKETCPAD_WIDTH + 20}px;
              padding: 8px;
              align-self: flex-end;
              display: flex;
              flex-direction: column;
              background: rgba(40, 40, 40, 0.4);
              display: ${isSketchpadVisible() ? 'block' : 'none'};
            `}
          >
            <div>
              <div
                class={css`
                  color: white;
                  font-weight: 900;
                  font-size: 24px;
                `}
              >
                {predictedLabel()
                  ? `Is it a ${predictedLabel()}?`
                  : 'Draw something!'}
              </div>
            </div>

            <canvas
              class={css`
                label: sketchpad-canvas;
                background-color: white;
                box-shadow: 0px 0px 10px 2px black;
              `}
              width={SKETCPAD_WIDTH}
              height={SKETCPAD_HEIGHT}
              ref={el => (sketchpadCanvasRef = el)}
            />
            <br />
            <button
              class={css`
                align-self: center;
                font-size: 20px;
                background-color: blue;
                color: white;
              `}
              onClick={() => {
                sketchpad.undo()
              }}
            >
              Undo{' '}
            </button>
          </div>

          <div>
            <div
              class={css`
                position: absolute;
                top: -30px;
                right: 0px;
              `}
            >
              <button
                onClick={() => {
                  setIsScketchpadVisible(!isSketchpadVisible())
                }}
                class={css`
                  background-color: orange;
                  border-color: yellow;
                  color: whitesmoke;
                  font-size: 20px;
                  font-weight: bold;
                  z-index: 300;
                `}
              >
                Toggle Sketchpad
              </button>
              <button
                onClick={() => {
                  setPlotType(prevType =>
                    prevType === 'featuresPlot'
                      ? 'confusionPlot'
                      : 'featuresPlot'
                  )
                }}
                class={css`
                  margin-left: 10px;
                  background-color: orange;
                  border-color: yellow;
                  color: whitesmoke;
                  font-size: 20px;
                  font-weight: bold;
                  z-index: 300;
                `}
              >
                {plotType() === 'featuresPlot'
                  ? 'Show Confusion Matrix'
                  : 'Show Classification Plot'}
              </button>
            </div>

            <div
              class={css`
                background-color: white;
                z-index: 100;
              `}
            >
              <div
                class={css`
                  label: confusion-chart-canvas;
                  display: ${plotType() === 'confusionPlot' ? 'block' : 'none'};
                  width: 800px;
                  height: 800px;
                  margin: 0;
                `}
              >
                <ConfusionMatrix samples={testingSamples} classes={CLASSES} />
              </div>

              <canvas
                class={css`
                  label: features-chart-canvas;
                  display: ${plotType() === 'featuresPlot' ? 'block' : 'none'};
                `}
                width={800}
                height={800}
                ref={ref => {
                  chartCanvasRef = ref
                }}
              ></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
