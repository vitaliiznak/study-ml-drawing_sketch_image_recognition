import path from "path";
import { fileURLToPath } from "url";
import { createCanvas } from "canvas";
import { drawPaths } from "./draw.mjs";
// Current file path using `import.meta.url`
const __filename = fileURLToPath(import.meta.url);
// Directory name from the current file path
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");
const RAW_DATA_DIR = DATA_DIR + "/raw";
const DATASET_DIR = DATA_DIR + "/dataset";
const JSON_DIR = DATASET_DIR + "/json";
const IMG_DIR = DATASET_DIR + "/img";
const SAMPLES = DATASET_DIR + "/samples.json";
const JS_OBJESCTS_DIR = ",./json_objects";
const SAMPLES_JS = JS_OBJESCTS_DIR + "/samples.json";
const canvas = createCanvas(400, 400);
const ctx = canvas.getContext("2d");
console.log('drawPaths', drawPaths);
async function init() {
    // const fileNames = fs.readdirSync(DATA_DIR);
    // const samples = [];
    // let i = 1;
    // for (const fileName of fileNames) {
    //   if(fileName.startsWith('.')) continue
    //   const file = fs.readFileSync(
    //     `${RAW_DATA_DIR}/${fileName}`,
    //     "utf8"
    //   );
    //   const { session, student, drawings } = JSON.parse(file);
    //   for (let label in drawings) {
    //     samples.push({
    //       id: i,
    //       label,
    //       studentName: student,
    //       studentId: session,
    //     });
    //     const paths = drawings[label];
    //     fs.writeFileSync(`${JSON_DIR}/${i}.json`, JSON.stringify(paths, null, 2));
    //     // await generateImageFile(paths, `${IMG_DIR}/${i}.png`);
    //     printProgress(i, fileNames.length * 8);
    //     i++;
    //   }
    // }
    // fs.writeFileSync(
    //   path.join(__dirname, SAMPLES),
    //   JSON.stringify(samples, null, 2)
    // );
    // fs.writeFileSync(
    //   path.join(__dirname, SAMPLES_JS),
    //   JSON.stringify(samples, null, 2)
    // );
}
// async function generateImageFile(paths: any, imgPath: string) {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   drawPaths(ctx, paths);
//   const buffer = canvas.toBuffer("image/png");
//   fs.writeFileSync(imgPath, buffer);
// }
// init();
//# sourceMappingURL=dataset_generator.mjs.map