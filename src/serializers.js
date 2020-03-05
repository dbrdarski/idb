const { getObjectShape } = require('./utils')

const serializers = []
const matchSerializer = o => serializers[getObjectShape(o)]
const addSerializer = (def, handler) => {
  serializers[JSON.stringify(def)] = handler
}

function serialize (output, data) {
  const handler = matchSerializer(data)
  if (handler) {
    const { meta } = output
    const { cursor, values, hashes } = this
    ++cursor.id
    output.id = data.id = handler(output, this.index, {
      cursor,
      data,
      meta,
      values,
      hashes
    })
    // return data.id
  }
}

const createSerializer = (context, output) => serialize.bind(context, output)

module.exports = {
  serializers,
  matchSerializer,
  addSerializer,
  createSerializer
}
