import fs from 'fs'
import { createCanvas } from 'canvas'
import { drawPaths } from './draw.mjs'
import { printProgress } from './utils.mjs'
import { CanvasRenderingContext2D } from 'canvas'
import { IMG_DIR, JSON_DIR, RAW_DATA_DIR, SAMPLES } from './constants.mjs'

const canvas = createCanvas(400, 400)
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')
const flaggedSamples = [
  121, 217, 305, 433, 434, 435, 436, 437, 438, 439, 440, 379, 381, 561, 657,
  705, 801, 881, 1033, 1257, 1258, 1259, 1261, 1260, 1262, 1263, 1264, 1361,
  1481, 1482, 1483, 1484, 1485, 1486, 1487, 1488, 1609, 1801, 1889, 1937, 1969,
  2281, 2465, 2705, 3081, 3082, 3083, 3084, 3085, 3086, 3087, 3088, 3225, 3377,
  3378, 3380, 3381, 3382, 3383, 3384, 3425, 3537, 3593, 3689, 3697, 3937, 4009,
  4609, 4865, 4866, 4867, 4868, 4869, 4870, 4871, 4872, 4873, 4874, 4875, 4876,
  4877, 4878, 4879, 4880, 4913, 4929, 4930, 4931, 4932, 4933, 4934, 4935, 4936,
  5225, 5249, 5250, 5256, 5257, 5258, 5259, 5260, 5261, 5262, 5263, 5264, 5361,
  5385, 5386, 5389, 5390, 5391, 5392, 5409, 5417, 5537, 5538, 5539, 5540, 5541,
  5542, 5543, 5544, 5193, 5194, 5195, 5196, 5197, 5198, 5199, 5200, 354, 658,
  659, 660, 661, 714, 802, 803, 804, 805, 1362, 1363, 1364, 1365, 1366, 1367,
  1610, 1611, 1938, 2018, 2019, 2020, 2022, 2258, 3202, 3426, 3427, 3428, 3429,
  3430, 3538, 3540, 3539, 3541, 3542, 3543, 3544, 3690, 3698, 3699, 3700, 3701,
  3702, 3703, 3704, 3691, 3692, 3693, 3694, 3695, 3696, 4010, 4610, 4611, 4612,
  4614, 4615, 5290, 5587, 5411, 5410, 5412, 5413, 5414, 5415, 5416, 5243, 4955,
  4954, 4956, 4957, 4958, 4959, 4960, 4835, 4475, 4411, 4403, 4211, 4043, 3995,
  3403, 2723, 2603, 1587, 1579, 1315, 683, 643, 339, 2356, 2652, 3732, 3875,
  3878, 4004, 4006, 4007, 4008, 5364, 5365, 5366, 5367, 5368, 5429, 5430, 5431,
  5432, 5586, 5588, 5589, 5590, 5591, 5596, 4701, 4613, 2965, 525, 78, 79, 1295,
  2031, 2791, 2792, 2759, 2760, 3399, 4702, 4950, 4967, 4968, 5143, 5222, 5223,
  5255, 5471, 5510, 5511, 5512, 5592, 5032, 5008, 3422, 3080, 2904, 2040, 1040,
  800, 640, 5627, 5628, 5629, 5712
]

async function init() {
  const fileNames = fs.readdirSync(RAW_DATA_DIR)
  const samples = []
  let i = 1
  for (const fileName of fileNames) {
    if (fileName.startsWith('.')) continue
    const file = fs.readFileSync(`${RAW_DATA_DIR}/${fileName}`, 'utf8')
    const { session, student, drawings } = JSON.parse(file)
    for (const label in drawings) {
      if (!flaggedSamples.includes(i)) {
        samples.push({
          id: i,
          label,
          studentName: student,
          studentId: session
        })
        const paths = drawings[label]
        fs.writeFileSync(
          `${JSON_DIR}/${i}.json`,
          JSON.stringify(paths, null, 2)
        )

        generateImageFile(paths, `${IMG_DIR}/${i}.png`)
        printProgress(i, fileNames.length * 8)
      }
      i++
    }
  }

  fs.writeFileSync(SAMPLES, JSON.stringify(samples, null, 2))
}

async function generateImageFile(paths: [number, number][][], imgPath: string) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawPaths(ctx, paths)
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(imgPath, buffer)
}

init()
