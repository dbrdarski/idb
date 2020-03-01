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
    const { cursor } = this
    ++cursor.id
    const offset = handler(output, this.index, {
      cursor,
      data,
      meta
    })
    if (offset) {
      cursor.position += offset
    }
  }
}

const createSerializer = (context, output) => serialize.bind(context, output)

module.exports = {
  serializers,
  matchSerializer,
  addSerializer,
  createSerializer
}
