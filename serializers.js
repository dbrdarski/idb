const { getObjectShape } = require('./utils')

const getId = ({ id }) => id
const serializers = []
const matchSerializer = o => serializers[getObjectShape(o)]
const addSerializer = (def, handler) => {
  serializers[JSON.stringify(def)] = handler
}


addSerializer(['value'], (output, index, { id, position, data, timestamp }) => {
  data.id = id
  data = data.value
  const record = JSON.stringify([ data, timestamp ])
  output.records.push(record)
  output.index.push(`${id}:${record.length}\n`)
  index[id] = {
    value: [ position, record.length ],
    enumerable: true
  }
  return record.length
})

addSerializer(['list'], (output, index, { id, data, timestamp }) => {
  data.id = id
  data = data.list
  const list = data.map(getId)
  output.index.push(`${id}${JSON.stringify(list)}\n`)
  index[id] = {
    value: list,
    enumerable: true
  }
})

addSerializer(['node'], (output, index, { id, data, timestamp }) => {
  data.id = id
  data = data.node
  const tag = getId(data.tag)
  const attrs = getId(data.attrs)
  const children = getId(data.children)
  const node = { tag, attrs, children }
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
