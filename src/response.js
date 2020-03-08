const { define, fill } = require('./utils')

const serializers = {}
const addResSerializer = (def, handler) => {
  define(serializers, JSON.stringify(def), handler)
}

const handle = (data, index, output) => {
  const handler = serializers[JSON.stringify(Object.keys(data))]
  if (handler) {
    return handler(data, index, output)
  }
}

const serializeResponse = (id, index, output) => {
  const entry = index[id]
  const { meta, ...data } = entry
  fill(output.meta, meta, serializeResponse, meta, index, output)
  fill(output.included, id, handle, data, index, output)
  return {
    id,
    meta,
    ...data
  }
}

addResSerializer(['list'], ({ list }, index, output) => {
  list.forEach((id) => {
    fill(output.included, id, serializeResponse, id, index, output)
  });
})

addResSerializer(['node'], ({ node }, index, output) => {
  Object.values(node).forEach((id) => {
    fill(output.included, id, serializeResponse, id, index, output)
  });
})

addResSerializer(['record','hash'], ({ id, record, hash }, index, output) => {
  console.log({ record, hash })
  fill(output.records, record[0], () => ({ id, record, hash }))
})

module.exports = {
  serializeResponse
}
