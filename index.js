const { create, Document, open } = require('./src/db')

// const name = 'sample';
const name = 'files/good1';

// Document.create(name)
Document.open(name)
  // .then(( doc ) => doc.find(4))
  .then(doc => {
    var r = doc.matchRecord([1, 'two', 'two', {
      tag: 'p',
      attrs: {
        class: 'text-right',
        items: 3,
        visible: true
      },
      children: ['Hello darkness my old friend. I\'ve come to talk with you again']
    }])
    console.log(r)
  })
  // .then(( doc ) => doc.writeLine('Hello darkness my old friend'))
  // .then(( doc ) => doc.writeLine('I have come for you again'))
  // .then(( doc ) => doc.writeLine('One two three, one two three'))
  // .then(( doc ) => doc.writeLine('123, 123'))
  // .then(console.log)

// let doc = new Document ({
//   name
// })

// doc.writeLine('Hello darkness my old friend')
// doc.writeLine('I have come for you again')
