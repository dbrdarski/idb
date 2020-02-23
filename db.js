const fs = require("fs")
const readline = require('readline')
const { getFilenames } = require('./utils')
const Document = require('./document')
// const path = "./sample.idb"
const indexParsers = []
const addIndexParser = (regex, handler) => {
  indexParsers.push({ regex, handler })
}
const matchIndexParser = (str, helpers) => {
  for (let i = 0; i < indexParsers.length; i++) {
    const match = str.match(indexParsers[i].regex)
    if (match) indexParsers[i].handler(match, helpers)
  }
}

addIndexParser({
  regex: /^([\d]+)\:([\d]+)$/,
  handler: ([ match, id, length ], { cursor, index }) => {
    Object.defineProperty(index, id, {
      value: { record: [ cursor.position, length ] },
      enumerable: true
    })
    cursor.position += length
    cursor.id = Number(id)
  }
})

addIndexParser({
  regex: /^([\d]+)(\[[\d]+(?:,[\d]+)*\])$/,
  handler: ([ match, id, data ]) => {
    const list = JSON.parse(data)
    Object.defineProperty(index, id, {
      value: { list },
      enumerable: true
    })
    cursor.id = Number(id)
  }
})

addIndexParser({
  // regex: /^([\d]+)\{"tag":([\d]+),"attrs":([\d]+),"children":([\d]+\})$/),
  regex: /^([\d]+)(\{"tag":[\d]+,"attrs":[\d]+,"children":[\d]+\})$/,
  handler: ([ match, id, data ]) => {
    const node = JSON.parse(data)
    Object.defineProperty(index, id, {
      node: { node },
      enumerable: true
    })
    cursor.id = Number(id)
  }
})

const open = (name, path = './') => {
  let position = 0
  let idCounter
  const { recordsFile, indexFile } = getFilenames(name, path)
  const index = {}
  return new Promise ((resolve, reject) => {
    const reader = readline.createInterface({
      input: fs.createReadStream(indexFile)
      // output: process.stdout
    })
    reader.on('line', (line) => {
      const [ id, lengthStr ] = line.split(':')
      const length = Number(lengthStr)
      Object.defineProperty(index, id, {
        value: [ position, length ],
        enumerable: true
      })
      // index[id] = [ position, length ]
      position += length
      idCounter = Number(id)
    }).on('close', () => {
      resolve(
        new Document({
          recordsFile,
          indexFile,
          idCounter,
          position,
          index
        })
      )
    })
  })
}

const create = (name, path = './') => {
  const { recordsFile, indexFile } = getFilenames(name, path)
  fs.closeSync(fs.openSync(recordsFile, 'w'))
  fs.closeSync(fs.openSync(indexFile, 'w'))
}


module.exports = {
  Document,
  create,
  open
}
