const fs = require("fs")
const readline = require('readline')
const { getFilenames, define } = require('./utils')
const Document = require('./document')
const { registerDefaultDataTypes } = require('./data-types')
// const path = "./sample.idb"

registerDefaultDataTypes()

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
      define(index, id, [ position, length ])
      // Object.defineProperty(index, id, {
      //   value: [ position, length ],
      //   enumerable: true
      // })

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
