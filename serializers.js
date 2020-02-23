const { getObjectShape } = require('./utils')

const getId = ({ id }) => id
const createId = require('js-sha1');
const serializers = []
const matchSerializer = o => serializers[getObjectShape(o)]
const addSerializer = (def, handler) => {
  serializers[JSON.stringify(def)] = handler
}


addSerializer(['value'], (output, index, { position, data, meta }) => {
  const record = JSON.stringify([ data.value, meta ])
  const id = createId(record)
  data.id = id
  output.records.push(record)
  output.index.push(`${id}:${record.length}\n`)
  index[id] = {
    value: [ position, record.length ],
    enumerable: true
  }
  return record.length
})

addSerializer(['list'], (output, index, { data, meta }) => {
  const list = data.list.map(getId)
  const id = createId(list)
  data.id = id
  output.index.push(`${id}${JSON.stringify(list)}\n`)
  index[id] = {
    value: list,
    enumerable: true
  }
})

addSerializer(['node'], (output, index, { data, meta }) => {
  const tag = getId(data.node.tag)
  const attrs = getId(data.node.attrs)
  const children = getId(data.node.children)
  const node = { tag, attrs, children }
  const id = JSON.stringify(node)
  data.id = id
  output.index.push(`${id}${JSON.stringify(node)}\n`)
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
