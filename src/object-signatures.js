const { getObjectShape, isPrimitive } = require('./utils')

const objectSignatures = {}
const addObjectSignature = (def, handler) => {
  objectSignatures[JSON.stringify(def)] = handler
}

addObjectSignature(['ref'], x => x)
addObjectSignature(['tag','attrs','children'], ({ tag, attrs, children }, resolve, match) => resolve({
  node: {
    tag: match(tag),
    attrs: match(attrs),
    children: match(children)
  }
}))

// const match = (record, output) => {
const match = (output) => {
  const resolve = (v) => {
    output.push(v)
    return v
  }
  return function match(record) {
    if (isPrimitive(record)) {
      return resolve({ value: record })
    } else if (Array.isArray(record)) {
      return resolve({ list: record.map(match) })
    } else {
      const handler = objectSignatures[getObjectShape(record)]
      if (handler) {
        return handler(record, resolve, match)
      } else {
        return resolve({ value: record })
      }
    }
  }
}

module.exports = {
  objectSignatures,
  addObjectSignature,
  match
}
