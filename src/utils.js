const getFilenames = (name, path) => {
  const filePath = `${path}/${name}`
  const recordsFile = `${filePath}.idb`
  const indexFile = `${filePath}.idx`
  return { recordsFile, indexFile }
}

const getObjectShape = (o) => JSON.stringify(Object.keys(o))
const matchShapes = (a, b) => getObjectShape(a) === getObjectShape(b)
const isReferential = (o) => Object(o) === o
const isPrimitive = (o) => Object(o) !== o

const define = (target, key, value) => Object.defineProperty(target, key, {
  value,
  enumerable: true
})

const fill = (target, key, fn, ...args) => {
  if(key != null && !target.hasOwnProperty(key)) {
    target[key] = fn(...args)
  }
}

const getId = ({ id }) => id
const createHash = require('js-sha1');

module.exports = {
  getId,
  define,
  fill,
  createHash,
  getFilenames,
  getObjectShape,
  matchShapes,
  isReferential,
  isPrimitive
}
