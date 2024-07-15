import { css } from '@emotion/css'
import { SampleT } from '@signumcode/ml-libs/dist/classifiers/knn'
import {
  Accessor,
  Component,
  createMemo,
  createSignal,
  onCleanup,
  onMount
} from 'solid-js'

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
  stylesForClasses: {
    [key: string]: {
      text?: string
      color?: string
      size?: number
      image?: HTMLImageElement
    }
  }
}> = ({ samples, classes, stylesForClasses }) => {
  let containerRef: HTMLElement
  const [cellWidth, setCellWidth] = createSignal(0)
  const [cellHeight, setCellHeight] = createSignal(0)
  const N = classes.length + 1
  const matrix = createMemo(() => {
    const matrixToReturn = Array.from({ length: N }, () => Array(N).fill(0))

    for (const s of samples()) {
      const i = classes.indexOf(s.trueLabel)
      const j = classes.indexOf(s.predictedLabel)

      matrixToReturn[i + 1][j + 1]++
    }

    for (let i = 1; i < N; i++) {
      for (let j = 1; j < N; j++) {
        matrixToReturn[i][0] += matrixToReturn[i][j]
        matrixToReturn[0][j] += matrixToReturn[i][j]
      }
    }

    for (let i = 1; i < N; i++) {
      matrixToReturn[0][i] -= matrixToReturn[i][0]
    }

    return matrixToReturn
  })

  const updateDimensions = () => {
    if (containerRef) {
      const width = containerRef.offsetWidth / (N + 2)
      setCellWidth(width)
      const height = containerRef.offsetHeight / (N + 2)
      setCellHeight(height)
    }
  }

  onMount(() => {
    const observer = new IntersectionObserver(updateDimensions, {
      threshold: [0.0, 1.0]
    })
    observer.observe(containerRef)
    window.addEventListener('resize', updateDimensions)

    updateDimensions()
    onCleanup(() => {
      observer.disconnect()
      window.removeEventListener('resize', updateDimensions)
    })
  })

  // const cellSize =
  return (
    <div
      ref={r => {
        containerRef = r
      }}
      class={css`
        position: relative;
        height: 100%;
        width: 100%;
        padding: 0;
        padding-left: ${cellWidth() / 2}px;
        padding-top: ${cellHeight() / 2}px;
        background: white;
      `}
    >
      <div
        class={css`
          position: absolute;
          top: 50%;
          left: ${cellWidth() / 4}px;
          text-align: center;
          width: 100%;
          transform: translate(-50%) rotate(-90deg);
          font-size: 20px;
        `}
      >
        Predicted Class
      </div>
      <div
        class={css`
          position: absolute;
          top: ${cellWidth() / 4}px;
          left: 0;
          text-align: center;
          width: 100%;
          font-size: 20px;
        `}
      >
        True Class
      </div>
      <table
        class={css`
          border-collapse: collapse;
          text-align: center;

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
                  background-image: url('${stylesForClasses[c].image?.src}');
                  background-repeat: no-repeat;
                  background-position: center 30%;
                  background-size: 30%;
                  vertical-align: bottom;
                `}
              >
                {c}
              </td>
            ))}
          </tr>
          {matrix().map((row, i) => {
            const classStyle = stylesForClasses[classes[i - 1]]

            return (
              <tr>
                {i === 0 ? (
                  <td
                    class={css`
                      height: ${cellHeight()}px;
                      width: ${cellWidth()}px;
                    `}
                  ></td>
                ) : (
                  <td
                    class={css`
                      height: ${cellHeight()}px;
                      width: ${cellWidth()}px;
                      background-image: url(${classStyle?.image?.src});
                      background-repeat: no-repeat;
                      background-position: center 20%;
                      background-size: 40%;
                      vertical-align: bottom;
                    `}
                  >
                    {classes[i - 1]}
                  </td>
                )}
                {row.map((count, j) => {
                  let cellString = count.toString()
                  if (i === 0 && count > 0) {
                    cellString = `${cellString}`
                  }
                  if (i === 0 && j === 0) {
                    cellString = ''
                  }

                  return (
                    <td
                      class={css`
                        height: ${cellHeight()}px;
                        width: ${cellWidth()}px;
                        text-align: center;
                      `}
                    >
                      {cellString}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ConfusionMatrix
