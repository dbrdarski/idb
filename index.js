const db = require('./src/db')
const { createDocument, openDocument } = db({ path: './files' })

// const name = 'sample';
const name = 'good2';

var doc1 = openDocument(name)
// .then(( doc ) => doc.find(10))

// createDocument(name).then(doc => {
//   var r = doc.write([1, 'two', 'two', {
//     tag: 'p',
//     attrs: {
//       class: 'text-right',
//       items: 3,
//       visible: true
//     },
//     children: ['Hello darkness my old friend. I\'ve come to talk with you again']
//   }])
//   console.log(r)
// })

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

const http = require('http');

// let counter = 0;

const requestListener = function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  const { headers, trailers, aborted, upgrade, url, method, statusCode, statusMessage } = req;
  doc1.then((doc) => {
    res.end(JSON.stringify(doc.find(10)))
  })
  // if (req.url != '/favicon.ico') {
  //     console.log(++counter)
  // }
  // res.end(JSON.stringify({ headers, trailers, aborted, upgrade, url, method, statusCode, statusMessage }))
}

const server = http.createServer(requestListener)
server.listen(8080)
