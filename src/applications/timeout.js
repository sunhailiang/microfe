
'use strict'
const TIMEOUTS = {
  bootstrap: {
    milliseconds: 3000,
    rejectWhenIimeout: false
  },
  mount: {
    milliseconds: 3000,
    rejectWhenIimeout: false
  },
  unmount: {
    milliseconds: 3000,
    rejectWhenIimeout: false
  }
}

export function reasonableTime (lifecyclePromise, description, timeout) {
  return new Promise((resolve, reject) => {
    let finished = false
    lifecyclePromise.then((data) => {
      finished = true
      resolve(data)
    }).catch(e => {
      finished = true
      reject(e)
    })
    setTimeout(() => {
      if (finished) {
        return
      }
      if (timeout.rejectWhenIimeout) {
        reject(`${description}`)
      } else {
        console.log("timeout but waiting");

      }
    }, timeout.milliseconds)
  })
}


export function ensureTimeout (timeouts = {}) {
  return {
    ...TIMEOUTS,
    ...timeouts
  }
  // return Object.assign({}, TIMEOUTS, timeouts)
}