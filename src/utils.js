const getFilenames = (name, path) => {
  const filePath = `${path}${name}`
  const recordsFile = `${filePath}.idb`
  const indexFile = `${filePath}.idx`
  return { recordsFile, indexFile }
}

const getObjectShape = (o) => JSON.stringify(Object.keys(o))
const matchShapes = (a, b) => getObjectShape(a) === getObjectShape(b)
const isReferential = (o) => Object(o) === o
const isPrimitive = (o) => Object(o) !== o

module.exports = {
  getFilenames,
  getObjectShape,
  matchShapes,
  isReferential,
  isPrimitive
}
