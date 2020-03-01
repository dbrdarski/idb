const fs = require("fs")

const { createSerializer } = require('./serializers')
const { matchIndexParser } = require('./parsers')
const { match } = require('./object-signatures')

const createHash = require('js-sha1');

// TODO: function handler for resolving


class Document {
  constructor ({ recordsFile, indexFile, position = 0, id = 0, index = {} }) {
    this.recordsFile = recordsFile
    this.indexFile = indexFile
    this.cursor = { id, position }
    // this.cursor.position = position
    // this.cursor.id = idCounter
    this.index = index
  }
  find (id) {
    const indexData = this.index[id]
    if (indexData == null) return null
    const [ start, length ] = indexData
    return this.readLine(start, length)
  }
  matchRecord (record) {
    const output = []
    match(output)(record)
    return this.save(output)
  }
  readLine (start, length) {
    return new Promise ((resolve, reject) => {
      fs.open(this.recordsFile, 'r', (error, fd) => {
        if (error) return reject(error)
        var buffer = new Buffer(length)
        fs.read(fd, buffer, 0, length, start, (error, bytesRead, buffer) => {
          if (error) return reject(error)
          const [ data, meta ] = JSON.parse(buffer.toString())
          resolve({ data, meta })
        })
      })
    })
  }
  save (records) {
    const output = {
      records: [],
      index: []
    }
    const meta = {
      author: 'Dane Brdarski',
      timestamp: Number(new Date)
    }

    const runSerializer = createSerializer(this, output)
    // const metadataRecord = JSON.stringify([metadata])
    // const metaId = ++this.cursor.id
    // const metaHash = createHash(metadataRecord)
    // output.records.push(metadataRecord)
    // output.index.push(`${metaId}:${metadataRecord.length}#${metaHash}\n`)
    //
    runSerializer({ meta })
    records.forEach(runSerializer)

    console.log(output)
    fs.appendFile(this.recordsFile, output.records.join(''), new Function)
    fs.appendFile(this.indexFile, output.index.join(''), new Function)
    // return new Promise ((resolve, reject) => {
    //
    // })
  }
  // addRecord (data) {
  //   return new Promise ((resolve, reject) => {
  //     const timestamp = Number(new Date)
  //     const record = JSON.stringify([ data, timestamp ])
  //     fs.appendFile(this.recordsFile, record, (err) => {
  //       if (err) return reject(err)
  //       const id = ++this.cursor.id
  //       const indexData = `${id}:${record.length}\n`
  //       fs.appendFile(this.indexFile, indexData, (err) => {
  //         if (err) return reject(err)
  //         Object.defineProperty(this.index, id, {
  //           value: [ this.cursor.position, record.length ],
  //           enumerable: true
  //         })
  //         this.cursor.position += record.length
  //         resolve(this)
  //       })
  //     })
  //   })
  // }
}

module.exports = Document
