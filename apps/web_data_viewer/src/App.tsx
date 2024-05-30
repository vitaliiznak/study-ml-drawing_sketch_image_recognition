import { createEffect, createResource, createSignal, onCleanup, type Component } from 'solid-js'
import { css } from '@emotion/css'

import Chart, { graphics } from '@signumcode/chart'
import { SampleT } from '@signumcode/chart/dist/chart';
import DataRows from './DataRows';
import { BASE_URL } from './constants';



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




const App: Component = () => {

  let chart: Chart | undefined
  const [emphasizedRowId, setEmphasizedRowId] = createSignal<number | null>(null)

  const [features, { refetch: refetchFeatres }] = createResource(
    fetchFeatures
  )


  let chartCanvas: HTMLCanvasElement | undefined

  const onDataRowsSampleClick = (sample: SampleT) => {
    if (chart) {
      setEmphasizedRowId(sample.id)
      chart.setActiveSampleById(sample.id)
    }
  }


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
    console.log({
      chartCanvas
    })
    setTimeout(() => {
      chart = new Chart(chartCanvas!, features().samples, options)

    }, 400)
  })


  onCleanup(() => {
    // google.visualization.events.removeAllListeners(window)
  })


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
        <DataRows features={features} emphasizedRowId={emphasizedRowId} onSample={onDataRowsSampleClick} />
        <div
          class={css`
            height: 100%;
          `} >
          <div
            class={css`
            position:fixed; 
            top: 20px;
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
