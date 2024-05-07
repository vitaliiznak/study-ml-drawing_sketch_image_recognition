import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

// Current file path using `import.meta.url`
const __filename = fileURLToPath(import.meta.url);
// Directory name from the current file path
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

app.use(
  "/json_objects",
  express.static(path.join(__dirname, "./json_objects"))
);

app.use(
  "/img",
  express.static(path.join(__dirname, "./data/dataset/img"))
);

const PORT = process.env.PORT || 3080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
