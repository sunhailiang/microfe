"use strict"
// 判断是不是一个promise
export function lookLikePromise (promise) {
  // 判断是不是Promise实例
  if (promise instanceof Promise) {
    return true
  }
  // 判断自定义Pormise
  return typeof promise === 'object' && typeof promise.then() === 'fucntion' && typeof promise.catch === 'function'

}
