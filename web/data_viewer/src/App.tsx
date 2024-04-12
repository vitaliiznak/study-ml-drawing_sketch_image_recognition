import type { Component } from "solid-js";
import samples from "../../../common/json_objects/samples.json";

const App: Component = () => {
  const samplesGroupedBySttudentId = Object.groupBy(
    samples,
    (type) => type.studentId
  );

  const rows = [];
  for (let studentId in samplesGroupedBySttudentId) {
    const studentSamples = samplesGroupedBySttudentId[studentId]!;
    if (!studentSamples.length) continue;
    const studentName = studentSamples[0].studentName;
    rows.push(
      <div>
        <label>{studentName}</label>

        {studentSamples.map((sample) => {
          return (
            <div>
              <div>{sample.label}</div>
              <div>
                <img
                  src={`../../../common/data/dataset/img/${sample.id}`}
                  alt={sample.label}
                ></img>
              </div>
            </div>
          );
        })}

      </div>
    );
  }

  return (
    <div>
      <header>
        Data viewer
        {rows}
      </header>
    </div>
  );
};

export default App;
