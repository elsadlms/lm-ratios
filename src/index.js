import { promises as fs } from 'fs';
import probe from 'probe-image-size';

async function readFile(filename, callback) {
  try {
    const data = await fs.readFile(`src/urls/${filename}`);
    const urls = data.toString().split('\t')

    callback(urls, filename)
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function getRatios(urls, filename) {
  let ratios = urls.map(async imgUrl => {
    if (!imgUrl) return ''
    const imgInfos = await probe(imgUrl)
    if (!imgInfos) return ''
    const ratio = (imgInfos.height / imgInfos.width).toFixed(3)
    return ratio
  })

  ratios = await Promise.all(ratios)
  console.log(filename, '\n', ratios.join('\t'))

  fs.writeFile(`src/ratios/${filename}`, ratios.join('\t'), err => {
    if (err) {
      console.error(err);
    }
  })
}

(async () => {
  try {
    const files = await fs.readdir('src/urls');

    for (const file of files) {
      readFile(file, getRatios)
    }
  }
  catch (e) {
    console.error(e);
  }
})();