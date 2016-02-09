import 'es6-collections'
import Promise from 'bluebird'

let DEFAULTS = {
  CONCURRENT_PROMISES: 1
}

// :: primary api
function Queue (maxConcurrent = DEFAULTS.CONCURRENT_PROMISES) {
  // :: hold all generators here
  const q = []

  // :: maintain metadata about all items in the queue
  const qmap = new WeakMap()

  /**
   * Add a Promise-generator to the queue.
   *
   * @param  item {Function} Generator function that returns a promise on invoke.
   */
  this.add = (item) => {
    // const _item = Object.assign({}, item)
    q.push(item)
    qmap.set(item, {})
  }

  this.start = () => {
    // :: marker to the current promise generator
    let currentIndex = 0

    // :: how many promises are active right now
    // let currentActive = 0

    return new Promise((resolve, reject) => {
      let isRejected = false

      function getPromise () {
        let generator = q[currentIndex++]
        // currentActive++

        console.log('Starting new promise.')

        return Promise.resolve(generator())
          // .finally(() => {
          //   currentActive--
          // })
          .then(result => {
            qmap.set(generator, result)
            return result
          })
          .catch(err => {
            isRejected = true
            reject({
              error: err,
              item: generator
            })
          })
          .then(() => {
            if (isRejected) { return Promise.reject() }
            if (currentIndex >= q.length) { return Promise.resolve() }

            // :: else, get the next promise from queue
            return getPromise()
          })
      }

      let promiseStreams = q.slice(0, maxConcurrent)
        .map(generator => {
          return getPromise()
        })

      Promise.all(promiseStreams)
        .then(() => {
          resolve(q.map(generator => qmap.get(generator)))
        })
    })
  }

  /**
   * Return the current length of the internal queue.
   *
   * @return {Number} The length of the internal queue.
   */
  this.size = () => q.length
}

export default Queue
