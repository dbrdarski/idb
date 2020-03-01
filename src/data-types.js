const { addSerializer } = require('./serializers')
const { addIndexParser } = require('./parsers')
const { define, createHash, getId } = require('./utils')
const { regexr } = require('./regex-builder')

const dataTypeEntries = []

const registerDataTypes = (fn) => {
  dataTypeEntries.push(fn)
}

const resolveDataTypes = () => {
  dataTypeEntries.forEach(fn => fn({
    addSerializer,
    addIndexParser
  }))
}

registerDataTypes(({
  addSerializer,
  addIndexParser
}) => {
  // VALUES
  addSerializer(['value'], (output, index, { cursor, data, values }) => {
    // data.id = cursor.id
    const record = JSON.stringify([ data.value ])
    const short = record.length < 40

    if (short) {
      const existing = values[record]
      if (existing != null) return existing
      define(values, record, cursor.id)
      output.index.push(`${cursor.id}|${output.meta}~${record}\n`)
      return cursor.id
    }

    const hash = createHash(record)
    output.records.push(record)
    output.index.push(`${cursor.id}|${output.meta}:${record.length}#${hash}\n`)
    define(index, cursor.id, [ cursor.position, record.length ])
    cursor.position += record.length
    return cursor.id
  })
  addIndexParser(regexr.value, ([ match, id, meta, valueRecord ], { cursor, index, values }) => {
    console.log([ match, id, meta, valueRecord, values ])
    const value = JSON.parse(valueRecord)
    define(index, id, { value })
    define(values, valueRecord, value)
  })
  addIndexParser(regexr.record, ([ match, id, meta, length, hash ], { cursor, index, hashes }) => {
    console.log([ match, id, meta, length, hash ])
    define(index, id, { record: [ cursor.position, length, hash ], meta })
    define(hashes, hash, id)
    cursor.position += length
    cursor.id = Math.max(Number(id), cursor.id)
    console.log("C", cursor.id)
  })

  // META:
  addSerializer(['meta'], (output, index, { cursor, data }) => {
    // data.id = cursor.id
    const metadata = JSON.stringify([ data ])
    const hash = createHash(metadata)
    define(output, 'meta', cursor.id)
    define(index, cursor.id, data)
    output.records.push(metadata)
    output.index.push(`${cursor.id}:${metadata.length}#${hash}\n`)
    return cursor.id
  })
  addIndexParser(regexr.meta, ([ match, id, length, hash ], { cursor, index, hashes }) => {
    define(index, id, { record: [ cursor.position, length ], hash })
    define(hashes, hash, id)
    cursor.position += length
    cursor.id = Math.max(Number(id), cursor.id)
    console.log("C", cursor.id)
  })

  // LIST
  addSerializer(['list'], (output, index, { cursor, data }) => {
    // data.id = cursor.id
    const list = data.list.map(getId)
    output.index.push(`${cursor.id}|${output.meta}${JSON.stringify(list)}\n`)
    define(index, cursor.id, list)
    return cursor.id
  })
  addIndexParser(regexr.list, ([ match, id, data, meta ], { cursor, index }) => {
    const list = JSON.parse(data)
    define(index, id, { list, meta })
    cursor.id = Math.max(Number(id), cursor.id)
    console.log("C", cursor.id)
  })

  // NODE
  addSerializer(['node'], (output, index, { cursor, data }) => {
    // data.id = cursor.id
    const tag = getId(data.node.tag)
    const attrs = getId(data.node.attrs)
    const children = getId(data.node.children)
    const node = { tag, attrs, children }
    const value = JSON.stringify(node)
    output.index.push(`${cursor.id}|${output.meta}${value}\n`)
    return cursor.id
  })
  addIndexParser(regexr.node, ([ match, id, data ], { cursor, index }) => {
    const node = JSON.parse(data)
    define(index, id, { node })
    cursor.id = Math.max(Number(id), cursor.id)
    console.log("C", cursor.id)
  })
})

module.exports = {
  registerDataTypes,
  resolveDataTypes
}
