import { createEffect, createResource, createSignal, onCleanup, onMount, type Component } from 'solid-js'
import { css } from '@emotion/css'

import Chart, { graphics } from '@signumcode/chart'
import { SampleT } from '@signumcode/chart/dist/chart'
import DataRows from './DataRows'
import { BASE_URL } from './constants'
import SketchPad from './Sketchpad/sketchpad'



const fetchFeatures = async () => {
  const response = await fetch(
    `${BASE_URL}/dataset/features.json`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch samples')
  }
  const features = await response.json()
  return features
}

type ChartConstructorParams = ConstructorParameters<typeof Chart>;




const getPathCount = (paths: [number, number][][]) => {
  return paths.length
}

const getPointCount = (paths: [number, number][][]) => {
  const points = paths.flat()
  return points.length
}

const App: Component = () => {

  let chart: Chart
  let sketchpadCanvasRef: HTMLCanvasElement
  let chartCanvas: HTMLCanvasElement | undefined
  let sketchpad: SketchPad

  const [isSketchpadVisible, setIsScketchpadVisible] = createSignal(true)
  const [emphasizedRowId, setEmphasizedRowId] = createSignal<number | null>(null)

  const [features, { refetch: refetchFeatres }] = createResource(
    fetchFeatures
  )


  onMount(() => {
    sketchpad = new SketchPad(sketchpadCanvasRef, {
      onUpdate: (paths) => {
        const sample = {
          point: [
            getPathCount(paths),
            getPointCount(paths)
          ],
        }
        chart.showDynamicPoint(sample)
      }
    })
  })

  onCleanup(() => {
    // google.visualization.events.removeAllListeners(window)
  })

  createEffect(() => {
    if (features.loading || chartCanvas === undefined) {
      return null // or some loading state/data
    }
    const options: ChartConstructorParams[2] = {
      axesLabels: features().featuresNames,
      styles: {
        car: { color: 'gray', text: '🚗' },
        fish: { color: 'red', text: '🐟' },
        house: { color: 'yellow', text: '🏠' },

        tree: { color: 'green', text: '🌲' },
        bicycle: { color: 'cyan', text: '🚲' },
        guitar: { color: 'blue', text: '🎸' },

        pencil: { color: 'magenta', text: '✏️' },
        clock: { color: 'lightgray', text: '🕒' },

      },
      icon: 'text',
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
      chart = new Chart(chartCanvas!, features().samples, options)

    }, 400)
  })

  createEffect(() => {
    if(!isSketchpadVisible()){
      chart?.hideDynamicPoint()
    } else {
      sketchpad.triggerUpdate()
    }
  })

  const onDataRowsSampleClick = (sample: SampleT) => {
    if (chart) {
      setEmphasizedRowId(sample.id)
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
          <div
            class={css`
              label: sketchpad-container;
              padding: 8px;
              align-self: flex-end;
              position: fixed;
              top: 38px;
              display: flex;
              flex-direction: column;
              background: rgba(40, 40, 40, 0.4);
              display: ${isSketchpadVisible() ? 'block' : 'none'};
            `}
          >
            <canvas
              class={css`
                label: sketchpad-canvas;
                background-color: white;
                box-shadow: 0px 0px 10px 2px black;
              `}
              width="400"
              height="400"
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
          <DataRows features={features} emphasizedRowId={emphasizedRowId} onSample={onDataRowsSampleClick} />
        </div>

  
        <div
          class={css`
            height: 100%;
          `} >
          <button
            onClick={
              () => {
                setIsScketchpadVisible(!isSketchpadVisible())
              }}
            class={css`
              position:fixed; 
              top: 10px;
              background-color: orange;
              color: whitesmoke;
              font-size: 20px;
              font-weight: bold;
              z-index: 300;
         `}
          >Toggle Sketchpad</button>
          <div
            class={css`
            position:fixed; 
            top: 38px;
            background-color: grey;
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

  )
}

export default App
