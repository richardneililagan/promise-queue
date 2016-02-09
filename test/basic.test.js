import test from 'tape'
import Promise from 'bluebird'
import Queue from '../src'

test('Queue length', (t) => {
  t.plan(2)
  const queue = new Queue()

  t.equal(queue.size(), 0, 'Initial length should be zero.')

  queue.add({})
  queue.add({})
  t.equal(queue.size(), 2, 'Should report correct queue length.')
})

test('Process flow', (t) => {
  t.timeoutAfter(500)
  const queue = new Queue()
  let count = 0

  let generator = () => {
    return new Promise(
      resolve => setTimeout(
        () => {
          console.log(alphabet[count])
          resolve(count++)
        }, 50
      )
    )
  }

  queue.add(generator)
  queue.add(generator)
  queue.add(generator)
  queue.add(generator)
  queue.add(generator)

  queue.start()
    .then(results => {
      console.log(results)
      t.equal(results.length, 5, 'Promise result should be a collection of all generator results.')
    })
    .catch(err => {
      console.log(err)
      t.fail('Failure occurred in promise chain.')
    })
    .finally(() => {
      t.end()
    })
})
