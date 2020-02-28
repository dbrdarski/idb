const fs = require("fs")
const readline = require('readline')
const { getFilenames, define, createHash, getId } = require('./utils')
const Document = require('./document')
const { addSerializer } = require('./serializers')
const { addIndexParser } = require('./parsers')

// const path = "./sample.idb"

const registerDataType = ({ shape, regex, handler, serializer }) => {
  addSerializer(shape, serializer)
  addIndexParser(regex, handler)
}

registerDataType({
  shape: ['value'], // where the fuck this comes into play?
  regex: /^([\d]+)\:([\d]+)#([0-9a-f]+)$/,
  serializer (output, index, { id, position, data }) {
    data.id = id
    const record = JSON.stringify([ data.value ])
    const short = record.length < 40

    if (short) {
      output.index.push(`${id}|${output.meta}~${record}\n`)
      return
    }

    const hash = createHash(record)
    output.records.push(record)
    output.index.push(`${id}|${output.meta}:${record.length}#${hash}\n`)
    define(index, id, [ position, record.length ])
    // index[id] = {
    //   value: [ position, record.length ],
    //   enumerable: true
    // }
    return record.length
  },
  handler ([ match, id, meta, length, hash ], { cursor, index, hashes }) {
    define(index, id, { record: [ cursor.position, length, hash ], meta })
    define(hashes, hash, id)
    cursor.position += length
    cursor.id = Number(id)
  }
})
// addIndexParser({
//   regex: /^([\d]+)\:([\d]+)#([0-9a-f]+)$/,
//   handler:
// })
registerDataType({
  shape: ['meta'], // where the fuck this comes into play?
  regex: /^([\d]+)(\[[\d]+)$/,
  serializer (output, index, { id, data }) {
    console.log({ id, data })
    data.id = id
    const metadata = JSON.stringify([ data ])
    const hash = createHash(metadata)
    define(output, 'meta', id)
    define(index, id, data)
    output.records.push(metadata)
    output.index.push(`${id}:${metadata.length}#${hash}\n`)
  },
  handler ([ match, id, length, hash ], { cursor, index, hashes }) {
    define(index, id, { record: [ cursor.position, length ], hash })
    define(hashes, hash, id)
    cursor.position += length
    cursor.id = Number(id)
  }
})
registerDataType({
  shape: ['list'], // where the fuck this comes into play?
  regex: /^([\d]+)(\[[\d]+(?:,[\d]+)*\])$/,
  serializer (output, index, { id, data }) {
    data.id = id
    const list = data.list.map(getId)
    // const hash = createHash(list)
    output.index.push(`${id}|${output.meta}${JSON.stringify(list)}\n`)
    define(index, id, list)
    // index[id] = {
    //   value: list,
    //   enumerable: true
    // }
  },
  handler ([ match, id, data, meta ]) {
    const list = JSON.parse(data)
    define(index, id, { list, meta })
    cursor.id = Number(id)
  }
})

registerDataType({
  shape: ['node'], // where the fuck this comes into play?
  // regex: /^([\d]+)\{"tag":([\d]+),"attrs":([\d]+),"children":([\d]+\})$/),
  regex: /^([\d]+)(\{"tag":[\d]+,"attrs":[\d]+,"children":[\d]+\})$/,
  serializer (output, index, { id, data }) {
    data.id = id
    const tag = getId(data.node.tag)
    const attrs = getId(data.node.attrs)
    const children = getId(data.node.children)
    const node = { tag, attrs, children }
    // const hash = JSON.stringify(node)
    output.index.push(`${id}|${output.meta}${JSON.stringify(node)}\n`)
    // const list = data.map(({ id }) => id )
    // output.index.push(`${id}${JSON.stringify(list)}\n`)
    // index[id] = {
    //   value: list,
    //   enumerable: true
    // }
  },
  handler ([ match, id, data ]) {
    const node = JSON.parse(data)
    define(index, id, { node })
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
