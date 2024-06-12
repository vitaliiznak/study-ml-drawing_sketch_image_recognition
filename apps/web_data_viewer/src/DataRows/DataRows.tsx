import {
  Accessor,
  createEffect,
  createMemo,
  createSignal,
  useTransition,
  type Component,
} from 'solid-js'
import { css, cx } from '@emotion/css'
import { SampleT } from '@signumcode/chart/dist/chart'
import { BASE_URL } from '../constants'

const flaggedUsers = [] as string[]

const tabsStyles = css`
  label: TrainingTestingTab;
  padding: 25px;
  font-family: sans-serif;
  color: #222;
  font-weight: bold;
  font-size: 22px;

  list-style: none;
  padding: 0;
  margin-bottom: 0;
  -webkit-margin-before: 0;
  -webkit-margin-after: 0;
  -webkit-margin-start: 0px;
  -webkit-margin-end: 0px;
  -webkit-padding-start: 0px;

  li {
    display: inline-block;
    margin-left: 0;
    padding: 10px;
    border-bottom: 2px solid #eee;
    transition: all 0.1s;
    font-family: sans-serif;
    font-weight: 300;
    cursor: pointer;
    color: #111;
  }

  li.selected {
    border-bottom: 4px solid #337ab7;
    font-weight: bolder;
    color: darkblue;
  }
`

function isElementInViewport(el: HTMLElement | Element) {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

const emphasizeSampleStyle = cx(
  css`
    background-color: orange !important;
    & img,
    & div {
      background-color: orange !important;
    }
  `,
  'emphasized-row',
)

const isCorrectSampleStyle = css`
  label: isCorrectSampleStyle;
  background-color: lightgreen !important;
`

const DataRows: Component<{
  featuresNames: string[]
  testingSamples: Accessor<
    (SampleT & { trueLabel: string; isCorrect?: boolean })[]
  >
  trainingSamples: Accessor<Array<SampleT>>
  emphasizedRowId: Accessor<number | null>
  onSample: (sample: SampleT) => void
}> = props => {
  let dataRowsContainerRef: HTMLElement | null = null
  let trainingDataStartRef: HTMLElement | null = null
  let testingDataStartRef: HTMLElement | null = null
  const { testingSamples, trainingSamples, featuresNames } = props

  const [tab, setTab] = createSignal<'TRAINING' | 'TESTING'>('TRAINING')
  const [pending, start] = useTransition()

  const trainingFeaturesGroupedByStudentId = createMemo(() => {
    // Example transformation: combining user data with product data
    return {
      samplesGroupedByStudentId: Object.groupBy(
        trainingSamples()!,
        type => type.studentId!,
      ),
      featuresNames,
    }
  })

  const testingFeaturesGroupedByStudentId = createMemo(() => {
    // Example transformation: combining user data with product data
    return {
      samplesGroupedByStudentId: Object.groupBy(
        testingSamples(),
        type => type.studentId!,
      ),
      featuresNames: featuresNames as string[],
    }
  })

  createEffect(() => {
    if (props.emphasizedRowId() && dataRowsContainerRef) {
      const scrollTarget =
        dataRowsContainerRef.getElementsByClassName('emphasized-row')[0]
      if (isElementInViewport(scrollTarget)) return
      scrollTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  })

  const testingSamplesMetadata = createMemo(() => {
    const toReturn = {
      totalCount: 0,
      correctCount: 0,
      accuracy: 0,
    }

    if (!testingSamples().length) return toReturn
    for (const sample of testingSamples()) {
      toReturn.totalCount++
      if (sample.isCorrect) {
        toReturn.correctCount++
      }
    }
    toReturn.accuracy = toReturn.correctCount / toReturn.totalCount
    return toReturn
  })

  const onSample = (sample: {
    id: number
    label: string
    studentName?: string
    studentId?: string
    point: number[]
  }) => {
    props.onSample(sample)
  }

  const dataRowRenderer = (
    entry: [
      string,
      Array<SampleT & { trueLabel?: string; isCorrect?: boolean }> | undefined,
    ],
  ) => {
    const [studentId, studentSamples] = entry
    const studentName = studentSamples![0]!.studentName

    return (
      <div
        class={[
          css`
            display: flex;
            align-items: center;
            ${flaggedUsers.includes(studentName!) ? 'filter: blur(5px);' : ''}
          `,
        ].join(' ')}
      >
        <label
          class={css`
            font-size: 28;
            font-weight: 700;
            width: 100px;
            overflow: hidden;
          `}
        >
          {studentName}
        </label>

        {studentSamples!.map(sample => {
          return (
            <div
              class={[
                css`
                  background-color: whitesmoke;
                  margin: 4px;
                `,
                sample.isCorrect ? isCorrectSampleStyle : '',
                props.emphasizedRowId() === sample.id
                  ? emphasizeSampleStyle
                  : '',
              ].join(' ')}
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
                {sample.label}
              </div>
              <img
                class={css`
                  width: 100px;
                `}
                src={`${BASE_URL}/img/${sample.id}.png`}
                alt={sample.label}
              ></img>
            </div>
          )
        })}
      </div>
    )
  }

  const updateTab = (tabKey: 'TRAINING' | 'TESTING') => () => {
    const offset = 80
    if (tabKey === 'TRAINING') {
      const elementPosition = trainingDataStartRef!.getBoundingClientRect().top
      const offsetPosition = elementPosition - offset
      window.scrollBy({ top: offsetPosition, behavior: 'smooth' })
    }
    if (tabKey === 'TESTING') {
      const elementPosition = testingDataStartRef!.getBoundingClientRect().top
      const offsetPosition = elementPosition - offset
      window.scrollBy({ top: offsetPosition, behavior: 'smooth' })
    }
    start(() => setTab(tabKey))
  }
  return (
    <div>
      <div
        class={css`
          position: fixed;
          left: 20px;
          top: 20px;
          z-index: 1000;
          background-color: rgb(135, 206, 235, 0.5);
          display: flex;
        `}
      >
        <ul class={tabsStyles}>
          <li
            classList={{ selected: tab() === 'TRAINING' }}
            onClick={updateTab('TRAINING')}
          >
            Training data
          </li>
          <li
            classList={{ selected: tab() === 'TESTING' }}
            onClick={updateTab('TESTING')}
          >
            Testing data
          </li>
        </ul>

        <span
          class={css`
            padding-left: 20px;
            padding-top: 10px;
            font-size: 20px;
          `}
        >
          | Accuracy: {testingSamplesMetadata().correctCount}/
          {testingSamplesMetadata().totalCount} (
          {Number(testingSamplesMetadata().accuracy * 100).toFixed(2)}%)
        </span>
      </div>

      <div
        class={css`
          display: flex;
          direction: row;
          height: 100%;
          padding-top: 70px;
          padding-left: 10px;
        `}
      >
        <div
          ref={ref => {
            dataRowsContainerRef = ref
          }}
        >
          <h4
            ref={ref => {
              trainingDataStartRef = ref
            }}
          >
            Training data
          </h4>
          {trainingFeaturesGroupedByStudentId().samplesGroupedByStudentId &&
            Object.entries(
              trainingFeaturesGroupedByStudentId().samplesGroupedByStudentId!,
            ).map(dataRowRenderer)}
          <h4
            ref={ref => {
              testingDataStartRef = ref
            }}
          >
            Testing data
          </h4>
          {testingFeaturesGroupedByStudentId().samplesGroupedByStudentId &&
            Object.entries(
              testingFeaturesGroupedByStudentId().samplesGroupedByStudentId!,
            ).map(dataRowRenderer)}
        </div>
      </div>
    </div>
  )
}

export default DataRows
