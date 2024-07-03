export const toCSV = (headers: string[], samples: (string | number)[][]) => {
  let str = headers.join(',') + '\n'
  for (const sample of samples) {
    str += sample.join(',') + '\n'
  }
  return str
}
