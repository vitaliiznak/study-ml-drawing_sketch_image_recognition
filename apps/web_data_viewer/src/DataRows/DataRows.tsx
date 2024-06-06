
import { Accessor, createEffect, createMemo, type Component } from 'solid-js'
import { css, cx } from '@emotion/css'
import { SampleT } from '@signumcode/chart/dist/chart'
import { BASE_URL } from '../constants'

const flaggedUsers = [] as string[]

function isElementInViewport(el: HTMLElement | Element) {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}


const emphasizeRowStyle = cx(css`
  background-color: orange  !important;;
   & img, & div {
    background-color: orange !important;
  }

`, 'emphasized-row')

const DataRows: Component<{
  featuresNames: string[]
  testingSamples: Accessor<(SampleT & { trueLabel: string; isCorrect?: boolean | undefined; })[]>
  trainingSamples: Accessor<Array<SampleT>>
  emphasizedRowId: Accessor<number | null>
  onSample: (sample: SampleT) => void
}> = (props) => {
  let dataRowsContainerRef: HTMLElement | null = null
  const { testingSamples, trainingSamples, featuresNames } = props

  const trainingFeaturesGroupedByStudentId = createMemo(() => {
    // Example transformation: combining user data with product data
    return {
      samplesGroupedByStudentId: Object.groupBy(
        trainingSamples()!,
        (type) => type.studentId!
      ),
      featuresNames
    }
  })


  const testingFeaturesGroupedByStudentId = createMemo(() => {

    // Example transformation: combining user data with product data
    return {
      samplesGroupedByStudentId: Object.groupBy(
        testingSamples(),
        (type) => (type).studentId!
      ),
      featuresNames: featuresNames as string[]
    }
  })


  createEffect(() => {
    if (props.emphasizedRowId() && dataRowsContainerRef) {
      const scrollTarget = dataRowsContainerRef.getElementsByClassName('emphasized-row')[0]
      if (isElementInViewport(scrollTarget)) return
      scrollTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  })


  const onSample = (sample: {
    id: number
    label: string
    studentName :string
    studentId?: string,
    point: number[]
  }) => {
    props.onSample(sample)
  }


  const dataRowRenderer = (entry: [string, unknown]) => {
    const [ studentId, studentSamples] = entry as  [string, Array<{
      id: number
      label: string
      studentName :string
      studentId?: string,
      point: number[]
    }>]
    const studentName = (studentSamples[0]).studentName
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

        {studentSamples.map((sample) => {
          return (
            <div
              class={[css`
                background-color: whitesmoke;
                margin: 4px;
              `,
              
          
                ,
                props.emphasizedRowId() === sample.id
                  ? emphasizeRowStyle
                  : ''
              ].join(' ')
              }

              onClick={() => {
                onSample(sample)
              }}
            >
              <div
                class={css`
              text-align: center;
              width: 100%;
              overflow: hidden;
            `}
              >
                {(sample).label}
              </div>
              <img
                class={css`
                  width: 100px;
                `}
                src={`${BASE_URL}/img/${sample.id}.png`}
                alt={(sample).label}
              ></img>
            </div>
          )
        })}
      </div>
    )
  }

  return (<div
    class={css`
    display:flex;
    height:100%;
  `}>
    <div ref={ref => { dataRowsContainerRef = ref }}>
      {trainingFeaturesGroupedByStudentId()?.samplesGroupedByStudentId &&
        Object.entries(trainingFeaturesGroupedByStudentId()?.samplesGroupedByStudentId! ).map(
          dataRowRenderer
        )
      }
      {testingFeaturesGroupedByStudentId()?.samplesGroupedByStudentId &&
        Object.entries(testingFeaturesGroupedByStudentId()?.samplesGroupedByStudentId! ).map(
          dataRowRenderer
        )
      }
    </div>
  </div>)
}


export default DataRows

