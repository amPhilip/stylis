import {compile, serialize, stringify, middleware, rulesheet, prefixer, namespace} from "../index.js"

const stack = []

describe('Middleware', () => {
	test('rulesheet', () => {
  	serialize(compile(`.user{ h1 {width:0;} @media{width:1;}@keyframes name{from{width:0;}to{width:1;}}}@import url('something.com/file.css');`), middleware([prefixer, stringify, rulesheet(value => stack.push(value))]))
  	expect(stack).to.deep.equal([
      `.user h1{width:0;}`,
      `@media{.user{width:1;}}`,
      `@-webkit-keyframes name{from{width:0;}to{width:1;}}`,
      `@keyframes name{from{width:0;}to{width:1;}}`,
      `@import url('something.com/file.css');`
    ])
  })

  test('namespace', () => {
  	expect(serialize(compile(`.user{width:0; :global(p,a){width:1;} h1 {width:1; h2:last-child {width:2} h2 h3 {width:3}}}`), middleware([namespace, stringify]))).to.equal([
      `.user{width:0;}`, `p,a{width:1;}`, `h1.user.user{width:1;}`, `h1.user h2:last-child.user{width:2;}`, `h1.user h2 h3.user{width:3;}`
    ].join(''))
  })

  test('comments', () => {
    expect(serialize(compile(`/*@noflip*/ .user{//noflip\n\n}`), middleware([value => value.type === 'comm' ? 'color:red;' : '', stringify]))).to.deep.equal([
      `color:red;.user{color:red;}`
    ].join())
  })

  test('prefixer', () => {
    expect(serialize(compile(`.user{h1:last-child{clip-path:none;}`), middleware([prefixer, stringify]))).to.equal([
      `.user h1:last-child{-webkit-clip-path:none;clip-path:none;}`,
    ].join(''))

    expect(serialize(compile(`@keyframes name{from{width:0;}to{width:1;}}`), middleware([prefixer, stringify]))).to.equal([
      `@-webkit-keyframes name{from{width:0;}to{width:1;}}`, `@keyframes name{from{width:0;}to{width:1;}}`
    ].join(''))

    expect(serialize(compile(`a:read-only{color:red;}`), middleware([prefixer, stringify]))).to.equal([
      `a:-moz-read-only{color:red;}`, `a:read-only{color:red;}`
    ].join(''))

    expect(serialize(compile(`a:read-write{color:red;}`), middleware([prefixer, stringify]))).to.equal([
      `a:-moz-read-write{color:red;}`, `a:read-write{color:red;}`
    ].join(''))

    expect(serialize(compile(`a::placeholder{color:red;}`), middleware([prefixer, stringify]))).to.equal([
      `a::-webkit-input-placeholder{color:red;}`, `a::-moz-placeholder{color:red;}`, `a:-ms-input-placeholder{color:red;}`, `a::placeholder{color:red;}`
    ].join(''))
  })
})
