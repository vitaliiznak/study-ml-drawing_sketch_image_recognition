
export const printProgress = function (count, max) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  const percent = (count / max * 100).toFixed(2);

  process.stdout.write(`Progress: ${count} / ${max} (${percent}%)`);
};
