const { getObjectShape } = require('./utils')

const getId = ({ id }) => id
const createHash = require('js-sha1');
const serializers = []
const matchSerializer = o => serializers[getObjectShape(o)]
const addSerializer = (def, handler) => {
  serializers[JSON.stringify(def)] = handler
}


addSerializer(['value'], (output, index, { id, position, data, meta }) => {
  data.id = id
  const record = JSON.stringify([ data.value ])
  const short = record.length < 40

  if (short) {
    output.index.push(`${id}|${meta}|${record}\n`)
    return
  }

  const hash = createHash(record)
  output.records.push(record)
  output.index.push(`${id}|${meta}:${record.length}#${hash}\n`)
  index[id] = {
    value: [ position, record.length ],
    enumerable: true
  }
  return record.length
})

addSerializer(['list'], (output, index, { id, data, meta }) => {
  data.id = id
  const list = data.list.map(getId)
  // const hash = createHash(list)
  output.index.push(`${id}|${meta}${JSON.stringify(list)}\n`)
  index[id] = {
    value: list,
    enumerable: true
  }
})

addSerializer(['node'], (output, index, { id, data, meta }) => {
  data.id = id
  const tag = getId(data.node.tag)
  const attrs = getId(data.node.attrs)
  const children = getId(data.node.children)
  const node = { tag, attrs, children }
  // const hash = JSON.stringify(node)
  output.index.push(`${id}|${meta}${JSON.stringify(node)}\n`)
  // const list = data.map(({ id }) => id )
  // output.index.push(`${id}${JSON.stringify(list)}\n`)
  // index[id] = {
  //   value: list,
  //   enumerable: true
  // }
})

module.exports = {
  serializers,
  matchSerializer,
  addSerializer
}
