import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
// Directory name from the current file path
const __dirname = path.dirname(__filename)

export const DATA_DIR = path.join(__dirname, '../../../packages/shared_data')
export const RAW_DATA_DIR = DATA_DIR + '/raw'
export const DATASET_DIR = DATA_DIR + '/dataset'
export const JSON_DIR = DATASET_DIR + '/json'
export const IMG_DIR = DATASET_DIR + '/img'

export const JS_OBJESCTS_DIR = path.join(
  __dirname,
  '../../../packages/shared_data/json_objects',
)

export const SAMPLES = DATASET_DIR + '/samples.json'
export const FEATURES = DATASET_DIR + '/features.json'
export const DECISION_BOUNDARY = DATASET_DIR + '/decision_boundary.png'

export const LABEL_COLORS = {
  car: 'red',
  fish: 'blue',
  house: 'yellow',
  tree: 'green',
  bicycle: 'cyan',
  guitar: 'lime',
  pencil: 'magenta',
  clock: 'lightgray',
}
