import { createEffect, createMemo, createResource, createSignal, onCleanup, type Component } from 'solid-js'
import { css } from '@emotion/css'

import Chart, { mathUtils, graphics } from '@signumcode/chart'

const BASE_URL = 'http://localhost:3080'

function isElementInViewport(el: HTMLElement | Element) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

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
const flaggedUsers = [] as string[]

type ChartConstructorParams = ConstructorParameters<typeof Chart>;

const App: Component = () => {
  let dataRowsContainerRef: HTMLElement | null = null

  const [features, { refetch: refetchFeatres }] = createResource(
    fetchFeatures
  )
  const [emphasizedRowId, setEmphasizedRowId] = createSignal<number | null>(null)

  let chartCanvas: HTMLCanvasElement | undefined


  const featuresTransformed = createMemo(() => {
    if (features.loading) {
      return null // or some loading state/data
    }

    // Example transformation: combining user data with product data
    return {
      samplesGroupedByStudentId: Object.groupBy(
        features().samples as any,
        (type) => (type as any).studentId
      ),
      featureNames: features().featureNames as any[]
    }
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
      onClick: (e, sample) => {
        if (sample) {
          setEmphasizedRowId(sample.id)
        } else {
          setEmphasizedRowId(null)
        }
      }
    }

    createEffect(() => {

      if (emphasizedRowId() && dataRowsContainerRef) {
        const scrollTarget = dataRowsContainerRef.getElementsByClassName('emphasized-row')[0]
        if (isElementInViewport(scrollTarget)) return
        scrollTarget.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
      // if (!emphasizedRowId() && tBodyRef) {
      //   tBodyRef.scrollIntoView({
      //     behavior: 'smooth',
      //     block: 'start'
      //   })
      // }
    })

    graphics.generateImagesAndAddToStyles(options.styles)

    const chart = new Chart(chartCanvas, features().samples, options)

    // google.charts.load('current', { 'packages': ['corechart'] })

    // google.charts.setOnLoadCallback(() => {
    //   const data = new google.visualization.DataTable()
    //   data.addColumn('number', features().featuresNames[0])
    //   data.addColumn('number', features().featuresNames[1])
    //   data.addRows(features().samples.map((s: any) => s.point))

    //   const chart = new google.visualization.ScatterChart(chartCanvas!)
    //   chart.draw(data, options)
    // })

  })


  onCleanup(() => {
    // google.visualization.events.removeAllListeners(window)
  })


  return (
    <div
      class={css`
        background-color: aqua;
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
        <div ref={ref => { dataRowsContainerRef = ref }}>
          {featuresTransformed()?.samplesGroupedByStudentId &&
            Object.keys(featuresTransformed()?.samplesGroupedByStudentId as any).map((studentId) => {
              const studentSamples =
                (featuresTransformed()?.samplesGroupedByStudentId as any)[studentId]!
              const studentName = (studentSamples[0] as any).studentName
              return (
                <div
                  class={[
                    css`
                      display: flex;
                      align-items: center;
                      ${flaggedUsers.includes(studentName)
                        ? 'filter: blur(5px);'
                        : ''}`,
                  ].join(' ')}
                >
                  <label
                    class={css`
                    padding-left: 10px;
                    font-size: 28;
                    font-weight: 700;
                    width: 100px;
                    overflow: hidden;
                  `}
                  >
                    {studentName}
                  </label>

                  {studentSamples.map((sample: any) => {
                    return (
                      <div
                        class={[css`
                        display: flex;
                        padding: 4px 2px;
                      `,

                        emphasizedRowId() === sample.id
                          ? 'emphasized-row'
                          : ''
                        ].join(' ')}
                      >
                        <div
                          class={css`
                          background-color: white;
                        `}
                        >
                          <div
                            class={css`
                            text-align: center;
                            width: 100%;
                            overflow: hidden;
                          `}
                          >
                            {(sample as any).label}
                          </div>
                          <img
                            class={css`
                            width: 100px;
                          `}
                            src={`${BASE_URL}/img/${sample.id}.png`}
                            alt={(sample as any).label}
                          ></img>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
        </div>
        <div
          class={css`
            min-width: 800px; 
            height: 800px;
            position:sticky; top: 40; left: 40;
            background-color: darkgray;
          `} >
          <canvas width={700} height={700}
            ref={(ref) => {
              chartCanvas = ref
            }}></canvas>
        </div>

      </div>

    </div >
  )
}

export default App
