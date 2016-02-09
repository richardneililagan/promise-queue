require('babel-register')
// :: tests go here
require('./basic.test.js')
require('tape')('eslint', require('tape-eslint')({
  ignore: ['lib/**']
}))
