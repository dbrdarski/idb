const indexParsers = []
const addIndexParser = (regex, handler) => {
  indexParsers.push({ regex, handler })
}

const matchIndexParser = (str, helpers) => {
  for (let i = 0; i < indexParsers.length; i++) {
    const match = str.match(indexParsers[i].regex)
    if (match) return indexParsers[i].handler(match, helpers)
  }
}

module.exports = {
  addIndexParser,
  matchIndexParser  
}
