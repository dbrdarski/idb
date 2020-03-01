const indexParsers = []
const addIndexParser = (regex, handler) => {
  indexParsers.push({ regex, handler })
}

const matchIndexParser = (str, helpers) => {
  console.log({ str })
  for (let i = 0; i < indexParsers.length; i++) {
    const match = str.match(indexParsers[i].regex)
    console.log({ reg: indexParsers[i].regex })
    if (match) return indexParsers[i].handler(match, helpers)
  }
  console.log('NO MATCH FOR: ', str)
}

module.exports = {
  addIndexParser,
  matchIndexParser
}
