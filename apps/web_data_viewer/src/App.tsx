import { createResource, type Component } from "solid-js";
import { css } from "@emotion/css";

const fetchAndGroupMatadateByUser = async () => {
  const response = await fetch(
    `http://localhost:3080/json_objects/samples.json`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch samples");
  }
  const samples = await response.json();

  const samplesGroupedByStudentId = Object.groupBy(
    samples as any,
    (type) => (type as any).studentId
  );

  return samplesGroupedByStudentId;
};

const flaggedUsers = [] as string[];

const App: Component = () => {
  const [samplesGroupedByStudentId, { refetch }] = createResource(
    fetchAndGroupMatadateByUser
  );

  return (
    <div
      class={css`
        background-color: aqua;
      `}
    >
      <header>
        Data viewer
        {samplesGroupedByStudentId() &&
          Object.keys(samplesGroupedByStudentId() as any).map((studentId) => {
            const studentSamples =
              (samplesGroupedByStudentId() as any)[studentId]!;
            const studentName = (studentSamples[0] as any).studentName;
            return (
              <div
                class={css`
                  display: flex;
                  align-items: center;
                  ${flaggedUsers.includes(studentName)
                    ? "filter: blur(5px);"
                    : ""}
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
                          {(sample as any).label}
                        </div>
                        <img
                          class={css`
                            width: 100px;
                          `}
                          src={`http://localhost:3080/img/${sample.id}.png`}
                          alt={(sample as any).label}
                        ></img>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
      </header>
    </div>
  );
};

export default App;
