import { createResource, type Component } from "solid-js";
import samples from "../../../common/json_objects/samples.json";
import { css } from "@emotion/css";

const fetchDatasetsMetadata = async () =>
  (await fetch(`http://localhost:3080/json_objects/samples.json`)).json();

const flaggedUsers = [] as string[];

const App: Component = () => {
  const [user, { refetch }] = createResource(fetchDatasetsMetadata);

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
      <div
        class={css`
          display: flex;
          align-items: center;
          ${flaggedUsers.includes(studentName) ? 'filter: blur(5px);' : ''}
        `}
      >
        <label
          class={css`
            padding-left: 10px;
            font-size: 28;
            font-weight: 700;
            width: 100px;
            overflow: hidden;
          `}
        >
          {studentName}
        </label>

        {studentSamples.map((sample) => {
          return (
            <div
              class={css`
                display: flex;
                padding: 4px 2px;
              `}
            >
              <div
                class={css`
                  background-color: white;
                `}
              >
                <div
                  class={css`
                    text-align: center;
                    width: 100%;
                    overflow: hidden;
                  `}
                >
                  {sample.label}
                </div>
                <img
                  class={css`
                    width: 100px;
                  `}
                  src={`http://localhost:3080/img/${sample.id}.png`}
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
    <div
      class={css`
        background-color: aqua;
      `}
    >
      <header>
        Data viewer
        {rows}
      </header>
    </div>
  );
};

export default App;
