import { createSignal, onMount, type Component } from 'solid-js'

import SketchPad from './sketchpad'
import { css } from '@emotion/css'

const labels = [
  'car',
  'fish',
  'house',
  'tree',
  'bicycle',
  'guitar',
  'pencil',
  'clock'
]

const NameView = ({ onDone }: { onDone: (name: string) => any }) => {
  let inputRef: HTMLInputElement
  const onNameInputSave = () => {
    const name = inputRef.value
    if (!name) {
      alert('Please input your name!')
    }
    onDone(name)
  }

  return (
    <div>
      <h4>Please Input your name first!</h4>
      <input
        title="Name Input"
        ref={el => {
          inputRef = el
        }}
        type="text"
      />
      <button onClick={onNameInputSave}>Save</button>
    </div>
  )
}

const App: Component = () => {
  let canvasRef: HTMLCanvasElement
  let sketchpad: SketchPad
  const [labelIndex, setLabelIndex] = createSignal(0)
  const [name, setName] = createSignal()

  const data = {
    student: '',
    session: crypto.randomUUID(),
    drawings: {} as { [key: string]: [number, number][][] }
  }

  onMount(() => {
    sketchpad = new SketchPad(canvasRef)
  })

  const onNameDone = (name: string) => {
    setName(name)
    data.student = name
  }

  const onNext = () => {
    if (sketchpad.paths.length === 0) {
      alert('Please draw something first!')
      return
    }
    setLabelIndex(labelIndex() + 1)
    data.drawings[labels[labelIndex()]] = sketchpad.paths
    sketchpad.reset()
  }

  const onSave = () => {
    const element = document.createElement('a')
    const stringifiedData = JSON.stringify(data, null, 2)
    element.setAttribute(
      'href',
      'data:apploication/json;charset=utf-8,' +
        encodeURIComponent(stringifiedData)
    )
    element.setAttribute('download', `${name()}_${data.session}.json`)
    // element.style.display = 'none'
    // document.body.appendChild(element)
    element.click()
    // document.body.removeChild(element)
  }

  return (
    <div
      class={css`
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translate(-50%, 0%);
        text-align: center;
      `}
    >
      <h1>Data Creator</h1>
      {!name() && <NameView onDone={onNameDone} />}
      <div
        class={css`
          display: ${name() ? 'block' : 'none'};
        `}
      >
        <div>
          {labelIndex() < labels.length ? (
            <h4>
              <span
                class={css`
                  padding-right: 4px;
                `}
              >
                Please draw a {labels[labelIndex()]}
              </span>
              <button onClick={onNext}>Next</button>
            </h4>
          ) : (
            <div>
              <h4>Thank you for your contribution!</h4>
              <pre>{JSON.stringify(data, null, 2)}</pre>
              <button onClick={onSave}>Save</button>
            </div>
          )}
        </div>
        <canvas
          class={css`
            background-color: white;
            box-shadow: 0px 0px 10px 2px black;
          `}
          width="400"
          height="400"
          ref={el => (canvasRef = el)}
        />
      </div>
    </div>
  )
}

export default App
