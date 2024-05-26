import { createEffect, createMemo, createResource, onCleanup, type Component } from 'solid-js'
import { css } from '@emotion/css'


const BASE_URL = 'http://localhost:3080'

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



const App: Component = () => {
  const [features, { refetch: refetchFeatres }] = createResource(
    fetchFeatures
  )

  let chartContainer: HTMLDivElement | undefined


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
    if (features.loading || chartContainer === undefined) {
      return null // or some loading state/data
    }
    console.log({
      features: features()
    })
    const options = {
      width: 400,
      heigh: 400,
      hAxis: { title: features().featuresNames[0] },
      vAxis: { title: features().featuresNames[1] }
    }

    google.charts.load('current', { 'packages': ['corechart'] })

    google.charts.setOnLoadCallback(() => {
      const data = new google.visualization.DataTable()
      data.addColumn('number', features().featuresNames[0])
      data.addColumn('number', features().featuresNames[1])
      data.addRows(features().samples.map((s: any) => s.point))

      const chart = new google.visualization.ScatterChart(chartContainer!)
      chart.draw(data, options)
    })

  })


  onCleanup(() => {
    google.visualization.events.removeAllListeners(window)
  })


  return (
    <div
      class={css`
        background-color: aqua;
      `}
    >
      <header>
        Data viewer
      </header>
      <div class={css`display:flex;`}>


        <div>
          {featuresTransformed()?.samplesGroupedByStudentId &&
            Object.keys(featuresTransformed()?.samplesGroupedByStudentId as any).map((studentId) => {
              const studentSamples =
                (featuresTransformed()?.samplesGroupedByStudentId as any)[studentId]!
              const studentName = (studentSamples[0] as any).studentName
              return (
                <div
                  class={css`
                  display: flex;
                  align-items: center;
                  ${flaggedUsers.includes(studentName)
                  ? 'filter: blur(5px);'
                  : ''}
                `}
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
                        class={css`
                        display: flex;
                        padding: 4px 2px;
                      `}
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
        <div class={css`min-width: 800px; height: 800px;`} >
          <div ref={chartContainer}></div>
        </div>

      </div>

    </div>
  )
}

export default App
