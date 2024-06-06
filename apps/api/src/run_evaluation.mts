import { FEATURES } from './constants.mts'
import fs from 'fs'







console.log("RUNNING CLASSIFICATIONS ....")


const features = JSON.parse(fs.readFileSync(FEATURES, 'utf8'))
const trainingSamples = features.trainingSamples
const testingSamples = features.testingSamples
