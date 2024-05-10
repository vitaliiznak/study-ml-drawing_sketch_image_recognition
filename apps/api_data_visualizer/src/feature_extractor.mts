import fs from "fs";
import {  JSON_DIR, SAMPLES } from "./constants.mjs";

const samples = JSON.parse(fs.readFileSync(SAMPLES, "utf8"));

const features = {};

const getPathCount = (paths: [number, number][][]) => {
  return paths.length;
};

const getPointCount = (paths: [number, number][][]) => {
  const points = paths.flat();
  return points.length;
};

for (const sample of samples) {
  const paths = JSON.parse(
    fs.readFileSync(`${JSON_DIR}/${sample.id}.json`, "utf8")
  );
}
