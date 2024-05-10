import fs from "fs";
import { createCanvas } from "canvas";
import { drawPaths } from "./draw.mjs";
import { printProgress } from "./utils.mjs";
import { CanvasRenderingContext2D } from "canvas";
import { IMG_DIR, JSON_DIR, RAW_DATA_DIR, SAMPLES, SAMPLES_JS } from "./constants.mjs";


const canvas = createCanvas(400, 400);
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

async function init() {
  const fileNames = fs.readdirSync(RAW_DATA_DIR);
  const samples = [];
  let i = 1;
  for (const fileName of fileNames) {
    if (fileName.startsWith(".")) continue;
    const file = fs.readFileSync(`${RAW_DATA_DIR}/${fileName}`, "utf8");
    const { session, student, drawings } = JSON.parse(file);
    for (const label in drawings) {
      samples.push({
        id: i,
        label,
        studentName: student,
        studentId: session,
      });
      const paths = drawings[label];
      fs.writeFileSync(`${JSON_DIR}/${i}.json`, JSON.stringify(paths, null, 2));

      await generateImageFile(paths, `${IMG_DIR}/${i}.png`);
      printProgress(i, fileNames.length * 8);
      i++;
    }
  }

  fs.writeFileSync(SAMPLES, JSON.stringify(samples, null, 2));

  fs.writeFileSync(SAMPLES_JS, JSON.stringify(samples, null, 2));
}

async function generateImageFile(paths: [number, number][][], imgPath: string) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPaths(ctx, paths);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(imgPath, buffer);
}

init();
