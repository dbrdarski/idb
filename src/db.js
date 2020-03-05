const Document = require('./document')

const fs = require('fs')
const readline = require('readline')

const { resolveDataTypes } = require('./data-types')
const { getFilenames } = require('./utils')
const { matchIndexParser } = require('./parsers')

resolveDataTypes()

const Database = ({ path = './' }) => {
  return {
    createDocument (name) {
     const { recordsFile, indexFile } = getFilenames(name, path)
     const doc = new Document ({ recordsFile, indexFile })
     fs.closeSync(fs.openSync(recordsFile, 'w'))
     fs.closeSync(fs.openSync(indexFile, 'w'))
     return Promise.resolve(doc)
   },
   openDocument (name) {
     const { recordsFile, indexFile } = getFilenames(name, path)
     const doc = new Document ({ recordsFile, indexFile })
     return new Promise ((resolve, reject) => {
       const reader = readline.createInterface({
         input: fs.createReadStream(indexFile)
       })
       reader.on('line', (line) => {
         matchIndexParser(line, doc)
       }).on('close', () => {
         resolve(doc)
       })
     })
   }
  }
}

module.exports = Database
