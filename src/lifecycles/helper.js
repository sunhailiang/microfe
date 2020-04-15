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
// 处理生命周期数组
export function flattenLifecyclesArray (lifecycle, description) {
  if (!Array.isArray(lifecycle)) {
    lifecycle = [lifecycle]
  }
  if (!lifecycle.length) {
    lifecycle = [() => Promise.resolve()]
  }

  // 对生命周期函数按顺序执行
  return props => new Promise((resolve, reject) => {
    waitForFunction(0)
    function waitForFunction (index) {
      let fn = lifecycle[index](props)
      // 如果不是一个promise直接返回错误信息
      if (!lookLikePromise(fn)) {
        reject(new Error(`${description}`))
      } else {
        // 处理生命周期函数
        fn.then(() => {
          if (index === lifecycle.length - 1) {
            resolve();
          } else {
            waitForFunction(++index)
          }
        }).catch((e) => {
          reject(e);
        })
      }
    }
  })

}
export function getProps (app) {
  return {
    name: app.name,
    ...app.customProps
  }
}