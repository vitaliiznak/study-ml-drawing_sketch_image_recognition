import { createEffect, createMemo, createResource, createSignal, onCleanup, type Component } from 'solid-js'
import { css } from '@emotion/css'

import Chart, { graphics, mathUtils } from '@signumcode/chart'
import { SampleT } from '@signumcode/chart/dist/chart'
import DataRows from './DataRows'
import { BASE_URL } from './constants'
import SketchPad from './Sketchpad/sketchpad'

const SKETCPAD_WIDTH = 400
const SKETCPAD_HEIGHT = 400

export type FeaturesT =  {
  trainingSamples: Array<SampleT>;
  testingSamples: Array<SampleT & {trueLabel: string; isCorrect?: boolean;}>;
  featuresNames: string[];
  samplesMinMax: {
    min: number[];
    max: number[];
  };
}


const fetchFeatures = async () => {
  const response = await fetch(
    `${BASE_URL}/dataset/features.json`
  )
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

type ChartConstructorParams = ConstructorParameters<typeof Chart>;

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

const inUseFunctions = inUse.map((feature) => feature.function)

const classify = (point: number[], samples: SampleT[], minMax?: {
  min: number[];
  max: number[];
}) => {
  const samplePoints = samples.map((s) => s.point) as [number, number][]
  const normalizedPoint = structuredClone(point)
  if(minMax){
    mathUtils.normalizePoints([normalizedPoint], minMax)
  }
  const indeces = mathUtils.getNearestPoints(normalizedPoint, samplePoints, 8)
  const nearestSamples = indeces.map((index) => samples[index])
  const labels = nearestSamples.map((sample) => sample.label)
  const labelCounts = labels.reduce((acc, label) => {
    acc[label] = (acc[label] || 0) + 1
    return acc
  } , {} as Record<string, number>)
  const maxLabel = Object.keys(labelCounts).reduce((a, b) => labelCounts[a] > labelCounts[b] ? a : b)
  return { predictedLabel: maxLabel, nearestSamples }
}

const App: Component = () => {

  let chart: Chart
  let sketchpadCanvasRef: HTMLCanvasElement
  let chartCanvas: HTMLCanvasElement | undefined
  let sketchpad: SketchPad

  const [predictedLabel, setPredictedLabel] = createSignal('')
  const [isSketchpadVisible, setIsScketchpadVisible] = createSignal(false)
  const [emphasizedRowId, setEmphasizedRowId] = createSignal<number | null>(null)

  const [features, { refetch: refetchFeatres }] = createResource(
    fetchFeatures
  )

  const trainingSamples = createMemo(() => {
    return features()?.trainingSamples || []
  })
 
  const testingSamples = createMemo(() => {
    const featuresData = features()
    if (!featuresData) return []
    
    return featuresData.testingSamples.map((sample) => {
      const { predictedLabel } = classify(sample.point, featuresData.trainingSamples)
      sample.isCorrect = sample.trueLabel === predictedLabel
      return sample
    })
  })

  const onDrawingsUpdate =  (paths: [number, number][][] ) => {
    const point = inUseFunctions.map((func) => func(paths)) as [number, number]
    const featuresMinMax = features()?.samplesMinMax
    const trainingSamles = features()!.trainingSamples
    const {predictedLabel, nearestSamples} = classify(point, trainingSamles, featuresMinMax)
    const label = predictedLabel

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
    if (features.loading || chartCanvas === undefined) {
      return null // or some loading state/data
    }
    const options: ChartConstructorParams[2] = {
      axesLabels: features()!.featuresNames,
      styles: {
        car: { color: 'gray', text: '🚗', size: 28 },
        fish: { color: 'red', text: '🐟', size: 28 },
        house: { color: 'yellow', text: '🏠', size: 28 },

        tree: { color: 'green', text: '🌲', size: 28 },
        bicycle: { color: 'cyan', text: '🚲' , size: 28},
        guitar: { color: 'blue', text: '🎸', size: 28 },

        pencil: { color: 'magenta', text: '🖌️' , size: 28},
        clock: { color: 'lightgray', text: '🕒' , size: 28},
        ['?']: { color: 'red', text: '❓' , size: 28},
      },
      icon: 'image',
      onClick: (_e, sample) => {
        if (sample) {
          setEmphasizedRowId(sample.id)
        } else {
          setEmphasizedRowId(null)
        }
      }
    }
    graphics.generateImagesAndAddToStyles(options.styles)
  
    setTimeout(() => {
      chart = new Chart(chartCanvas!, [...features()!.trainingSamples], options)
      sketchpad = new SketchPad(sketchpadCanvasRef, {
        onUpdate: onDrawingsUpdate
      })

    }, 400)
  })

  createEffect(() => {
    if(!isSketchpadVisible()){
      chart?.hideDynamicSample()
    } else {
      sketchpad?.triggerUpdate()
    }
  })

  const onDataRowsSampleClick = (sample: Pick<SampleT,'id'|'label' | 'point' >) => {
    setEmphasizedRowId(sample.id)
    if(sample.label === '?'){
      chart.showDynamicSample(sample, [])
    }else if (chart) {
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
      <header>
        Data viewer
      </header>
   
      <div
        class={css`
          display:flex;
          height:100%;
        `}>
        <div
          class={css`
            background-color:green;
            display:flex;
            flex-direction:column;
          `}
        >
         
          <DataRows 
            testingSamples={testingSamples}
            trainingSamples={trainingSamples}
            featuresNames={features()?.featuresNames || []}
            emphasizedRowId={emphasizedRowId} 
            onSample={onDataRowsSampleClick} 
            
          />
        </div>

  
        <div
          class={css`
            height: fit-content;
            min-width: 800px;
            width: fit-content;
            position:fixed; 
            top: 20px;
            right: 0;
          `} >
            
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
                class={
                  css`
                  color: white;
                  font-weight: 900;
                  font-size: 24px;
                  `
                }
              >
                {predictedLabel() ? `Is it a ${predictedLabel()}?` : 'Draw something!'}
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
              ref={(el) => (sketchpadCanvasRef = el)}
            /><br />
            <button
              class={
                css`
                  align-self: center;
                  font-size: 20px;
                  background-color:blue;
                  color: white;
                `
              }
              onClick={() => {
                sketchpad.undo()
              }}>Undo </button>
          </div>
   

          <div>
            <button
              onClick={
                () => {
                  setIsScketchpadVisible(!isSketchpadVisible())
                }}
              class={css`
              position:relative; 
              top: 0px;
              background-color: orange;
              color: whitesmoke;
              font-size: 20px;
              font-weight: bold;
              z-index: 300;
         `}
            >Toggle Sketchpad</button>
            <div
              class={css`
                background-color: white;
                z-index: 100;
          `} >
              <canvas width={800} height={800}
                ref={(ref) => {
                  chartCanvas = ref
                }}></canvas>
            </div>
          </div>
        </div>
       

      </div>
    </div>

  )
}

export default App
