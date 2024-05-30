
import { Accessor, Resource, createEffect, createMemo, type Component } from 'solid-js'
import { css, cx } from '@emotion/css'
import { SampleT } from '@signumcode/chart/dist/chart';
import { BASE_URL } from '../constants';

const flaggedUsers = [] as string[]

function isElementInViewport(el: HTMLElement | Element) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}


const emphasizeRowStyle = cx(css`
  background-color: orange  !important;;
   & img, & div {
    background-color: orange !important;
  }

`, 'emphasized-row')

const DataRows: Component<{
  features: Resource<any>
  emphasizedRowId: Accessor<number | null>
  onSample: (sample: SampleT) => void
}> = (props) => {
  let dataRowsContainerRef: HTMLElement | null = null
  const { features } = props



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
    if (props.emphasizedRowId() && dataRowsContainerRef) {
      const scrollTarget = dataRowsContainerRef.getElementsByClassName('emphasized-row')[0]
      if (isElementInViewport(scrollTarget)) return
      scrollTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  })


  const onSample = (sample: SampleT) => {
    props.onSample(sample)
  }

  return (<div
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

              {studentSamples.map((sample: SampleT) => {
                return (
                  <div
                    class={[css`
                    background-color: whitesmoke;
                    margin: 4px;
                  `,
                    props.emphasizedRowId() === sample.id
                      ? emphasizeRowStyle
                      : ''
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

                )
              })}
            </div>
          )
        })}
    </div>
  </div>)
}


export default DataRows

