const fs = require("fs")
const readline = require('readline')
const { getFilenames, define } = require('./utils')
const Document = require('./document')
const { resolveDataTypes } = require('./data-types')
const { matchIndexParser } = require('./parsers')

// const path = "./sample.idb"

resolveDataTypes()

const open = (name, path = './') => {
  let position = 0
  let id = 0
  const { recordsFile, indexFile } = getFilenames(name, path)
  const index = {}
  const hashes = {}
  const values = {}
  const cursor = { id, position }
  return new Promise ((resolve, reject) => {
    const reader = readline.createInterface({
      input: fs.createReadStream(indexFile)
      // output: process.stdout
    })
    reader.on('line', (line) => {
      matchIndexParser(line, { index, cursor, hashes, values })
      // const [ id, lengthStr ] = line.split(':')
      // const length = Number(lengthStr)
      // define(index, id, [ position, length ])
      // // Object.defineProperty(index, id, {
      // //   value: [ position, length ],
      // //   enumerable: true
      // // })
      //
      // // index[id] = [ position, length ]
      // position += length
      // id = Number(id)
    }).on('close', () => {
      const doc = new Document({
        recordsFile,
        indexFile,
        index,
        ...cursor
      })
      console.log(doc)
      resolve(doc)
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
