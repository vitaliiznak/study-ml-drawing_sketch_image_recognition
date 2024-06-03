import { register } from "ts-node/esm";
import { pathToFileURL } from "node:url";

register({
  project: pathToFileURL(new URL('./tsconfig.json', import.meta.url))
});