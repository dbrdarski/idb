const { define } = require('./utils')

const tokens = {}
const addToken = (name, regex) => {
  define(tokens, name, regex)
}

addToken('id', '([\\d]+)')
addToken('value', '~(.+)')
addToken('meta', '\\|([\\d]+)')
addToken('length', '\\:([\\d]+)')
addToken('hash', '#([0-9a-f]+)')
addToken('list', '(\\[[\\d]+(?:,[\\d]+)*\\])')
addToken('node', '(\\{"tag":[\\d]+,"attrs":[\\d]+,"children":[\\d]+\\})')

const regexr = (fn, ...args) => RegExp(fn(tokens), ...args)
// const regexTemplates = {}
const registerRegex = (name, template) => {
  define(regexr, name, template)
}

registerRegex('meta', regexr(({
  id, length, hash
}) => `^${id}${length}${hash}$`))

registerRegex('record', regexr(({
  id, meta, length, hash
}) => `^${id}${meta}${length}${hash}$`))

registerRegex('value', regexr(({
  id, meta, value
}) => `^${id}${meta}${value}$`))

registerRegex('list', regexr(({
  id, meta, list
}) => `^${id}${meta}${list}$`))

registerRegex('node', regexr(({
  id, meta, node
}) => `^${id}${meta}${node}$`))


module.exports = {
  regexr
}
