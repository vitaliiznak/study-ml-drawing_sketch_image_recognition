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
        title='Name Input'
        ref={(el) => {
          inputRef = el
        }}
        type="text"
      />
      <button onClick={onNameInputSave}>Save</button>
    </div>
  )
}

export default NameView
