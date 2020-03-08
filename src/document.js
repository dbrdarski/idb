const fs = require('fs')

const { createSerializer } = require('./serializers')
const { match } = require('./object-signatures')
const { define } = require('./utils')
const { serializeResponse } = require('./response')

const createHash = require('js-sha1')

// TODO: function handler for resolving

class Document {
  constructor ({ recordsFile, indexFile, position = 0, id = 0, index = {}, hashes = {}, values = {}}) {
    define(this, 'recordsFile', recordsFile)
    define(this, 'indexFile', indexFile)
    this.cursor = { id, position }
    this.hashes = hashes
    this.values = values
    this.index = index
  }

  // static create (name, path = './') {
  //   const { recordsFile, indexFile } = getFilenames(name, path)
  //   const doc = new Document ({ recordsFile, indexFile })
  //   fs.closeSync(fs.openSync(recordsFile, 'w'))
  //   fs.closeSync(fs.openSync(indexFile, 'w'))
  //   return Promise.resolve(doc)
  // }
  //
  // static open (name, path = './') {
  //   const { recordsFile, indexFile } = getFilenames(name, path)
  //   const doc = new Document ({ recordsFile, indexFile })
  //   return new Promise ((resolve, reject) => {
  //     const reader = readline.createInterface({
  //       input: fs.createReadStream(indexFile)
  //     })
  //     reader.on('line', (line) => {
  //       matchIndexParser(line, doc)
  //     }).on('close', () => {
  //       resolve(doc)
  //     })
  //   })
  // }

  find (id) {
    if (id == null ) return this.index

    // const indexData = this.index[id]
    // if (indexData == null) return null
    // const [ start, length ] = indexData
    // return this.readLine(start, length)

    const output = {
       meta: {},
       data: {},
       included: {},
       records: {}
    }

    output.data = serializeResponse(id, this.index, output)
    const { records, ...response } = output
    const r = Object.entries(records).sort(([a],[b]) => {
      a = Number(a)
      b = Number(b)
      return a === b ? 0 : a < b ? -1 : 1
    })
    return { ...response, records: r }
  }

  write (record) {
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
      id: null,
      records: [],
      index: []
    }
    const meta = {
      author: 'Dane Brdarski',
      timestamp: Number(new Date)
    }

    const runSerializer = createSerializer(this, output)
    runSerializer({ meta })
    records.forEach(runSerializer)

    // console.log(output)
    fs.appendFile(this.recordsFile, output.records.join(''), new Function)
    fs.appendFile(this.indexFile, output.index.join(''), new Function)

    return output.id
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
