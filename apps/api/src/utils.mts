
export const printProgress = function (count: number, max : number) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  const percent = (count / max * 100).toFixed(2);

  process.stdout.write(`Progress: ${count} / ${max} (${percent}%)`);
};
