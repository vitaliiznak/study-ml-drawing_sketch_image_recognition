import { createEffect, createSignal, on, onCleanup, onMount, type Component } from 'solid-js'
import { css, cx } from '@emotion/css'
import mathUtils from './mathUtils'
import Chart, { OptionsT, SampleT } from './chart'
import graphics from './graphics'


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
  background-color: yellow;
`, 'emphasized-row')

const App: Component = () => {
  let tBodyRef: HTMLTableSectionElement | null = null
  const [canvasFontLoaded, setCanvasFontLoaded] = createSignal(false)
  const [emphasizedRowId, setEmphasizedRowId] = createSignal<number | null>(null)

  let chart: Chart | undefined
  let refCanvas: HTMLCanvasElement | null = null
  const N = 1000
  const samples: SampleT[] = Array.from({ length: N }, (_, i) => {
    const type = Math.random() > 0.5 ? 'sport' : 'basic'
    const km = mathUtils.lerp(3000, 300_000, Math.random())
    const price = mathUtils.remap(3000, 300_000, 9_000, 900, km)
      + mathUtils.lerp(-2000, 2000, Math.random())
      + (type === 'basic' ? 0 : 5000)

    return ({
      id: i + 1,
      label: type,
      point: [km, price]
    })
  })

  const options = {
    /*    size: 250, */
    axesLabels: ['Kilomiters', 'Price'],
    icon: 'image',
    styles: {
      basic: {
        text: '🚗',
        color: 'blue',
        size: 34,
      },
      sport: {
        text: '🏎️',
        color: 'red',
        size: 34,
      }
    },
    onClick: (_e, sample) => {
      if (sample) {
        setEmphasizedRowId(sample.id)
      } else {
        setEmphasizedRowId(null)
      }
    }
  } as OptionsT

  createEffect(() => {

    if (emphasizedRowId() && tBodyRef) {
      const scrollTarget = tBodyRef.getElementsByClassName('emphasized-row')[0]
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

  onMount(() => {
    const fontName = 'Courier New'
    const fontSize = '14px'

    // Check if the font is already loaded
    if (document.fonts.check(`${fontSize} ${fontName}`)) {
      setCanvasFontLoaded(true)
    } else {
      // Attach a listener to be notified when fonts are loaded
      document.fonts.ready.then(() => {
        setCanvasFontLoaded(true)
      })
    }

    onCleanup(() => {
      // Clean up any resources or listeners if needed
    })
  })

  createEffect(() => {
    if (canvasFontLoaded() && refCanvas) {
      setTimeout(() => {
        chart = new Chart(refCanvas!, samples, options)
      }, 100)
    }
  })

  return (
    <div>
      <header>
        <h1>Custom Chart Demo</h1>
        <div class={css`display: flex;`}>

          <table class={
            css`
              border: 2px solid white;
              padding: 4px;
              text-align: center;
              border-collapse: collapse;
              margin-left: 20px;
              & th {
                padding: 8px;
                font-weight: bold;
              }
              & tr {
                padding: 4px;
                border: 1px solid white;
              }
              & td {
                padding: 4px;
                border: 1px solid white;
              }
            `
          }>
            <thead>
              <tr>
                <th>Id</th>
                <th>Label</th>
                <th>Km</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody ref={(ref) => {
              tBodyRef = ref
            }}>
              {samples.map(({ id, label, point }) => (
                <tr
                  class={[
                    emphasizedRowId() === id ? emphasizeRowStyle : '',
                    css`
                    cursor: pointer;
                    &:hover {
                      background-color: #444;
                      color: white;
                    }
                  `
                  ].join(' ')}
                  onClick={
                    () => {
                      if (chart) {
                        setEmphasizedRowId(id)
                        chart.setActiveSampleById(id)
                      }
                    }
                  }>
                  <td>{id}</td>
                  <td>{label}</td>
                  <td>{point[0].toFixed(0)}</td>
                  <td>{point[1].toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div class={
            css`
              position: fixed;
              right:0;
              top: 40%;
              transform: translateY(-50%);
              padding-right: 10px;
            `
          }>
            <canvas width="780" height="780" id="chartCanvas"
              class={
                css`
                  background-color: #333;
                `}
              ref={(ref) => { refCanvas = ref }}
            ></canvas>
          </div>
        </div>
      </header >
    </div >
  )
}

export default App
