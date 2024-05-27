import express from 'express'

import cors from 'cors'
import { fileURLToPath } from 'url'
import { DATASET_DIR, IMG_DIR, JS_OBJESCTS_DIR } from './constants.mjs'

// Current file path using `import.meta.url`
const __filename = fileURLToPath(import.meta.url)
// Directory name from the current file path

const app = express()
app.use(cors())

app.use(
  '/json_objects',
  express.static(JS_OBJESCTS_DIR)
)

app.use(
  '/dataset',
  express.static(DATASET_DIR)
)

app.use(
  '/img',
  express.static(IMG_DIR)
)


const PORT = process.env.PORT || 3080
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
