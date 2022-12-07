import { promises as fs } from 'fs';
import probe from 'probe-image-size';

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

async function readFile(month, callback) {
  try {
    const data = await fs.readFile(`src/urls/${month.index}-${month.id}.tsv`);
    const urls = data.toString().split('\t')

    callback(urls, month)
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function getRatios(urls, month) {
  let ratios = urls.map(async imgUrl => {
    const imgInfos = await probe(imgUrl)
    const ratio = (imgInfos.height / imgInfos.width).toFixed(3)
    return ratio
  })
  ratios = await Promise.all(ratios)
  console.log(month.id, '\n', ratios.join('\t'))

  fs.writeFile(`src/ratios/${month.index}-${month.id}.tsv`, ratios.join('\t'), err => {
    if (err) {
      console.error(err);
    }
  })
}

for (const [index, month] of months.entries()) {
  readFile({ id: month, index: index + 1 }, getRatios)
}
